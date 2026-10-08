#!/usr/bin/env python3
"""Local read-only dashboard for /company companies.

Reads ~/.claude/company-hq/companies/<id>/state.json (written by the
company-hq mod) and the plan documents of each company, and serves them on
127.0.0.1 with live updates over Server-Sent Events. No model calls, no
network beyond loopback, Python stdlib only.

  python3 company-dashboard.py [--home DIR] [--port N] [--idle-minutes N]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

APP = "company-dashboard"
VERSION = "0.1.0"
HERE = Path(__file__).resolve().parent

# ---------------------------------------------------------------- parsing

TASK = re.compile(r"^\s*-\s\[( |x|X)\]\s+(T\d+)\s+(.*?)\s*$")
MARK = re.compile(r"\{(added|verified|rejected(?::\s*([^}]*))?)\}")
RESULT = re.compile(r"^Result:\s*(PASS|FAIL)\b(.*)$", re.M)
PHASES = ["plan", "build", "review", "test", "done"]


def parse_tasks(md: str) -> list[dict]:
    """Tasks under '## Tasks' in an architecture doc (see sprint-orchestrate
    references/tasks.md). Lines that do not match the grammar are skipped."""
    tasks, inside = [], False
    for line in md.splitlines():
        if re.match(r"^#{1,6}\s", line):
            inside = re.match(r"^##\s+Tasks\s*$", line) is not None
            continue
        if not inside:
            continue
        m = TASK.match(line)
        if not m:
            continue
        rest = m.group(3)
        added, state, reason = False, None, None
        for mk in MARK.finditer(rest):
            if mk.group(1) == "added":
                added = True
            elif mk.group(1) == "verified":
                state = "verified"
            else:
                state, reason = "rejected", (mk.group(2) or "").strip()
        title = MARK.sub("", rest).strip()
        done = m.group(1).lower() == "x"
        status = state if (done and state) else ("done" if done else "todo")
        tasks.append({"id": m.group(2), "title": title, "status": status, "added": added, "reason": reason})
    return tasks


def test_result(md: str) -> str | None:
    m = RESULT.search(md)
    return m.group(1) if m else None


def part_phase(has_arch: bool, tasks: list[dict], result: str | None, merged: bool, running: int) -> str:
    """Deterministic phase of a part, first match wins (design §5)."""
    if merged:
        return "done"
    if any(t["status"] == "rejected" for t in tasks) or result == "FAIL":
        return "build"
    if result == "PASS":
        return "test"
    if tasks and all(t["status"] == "verified" for t in tasks):
        return "test"
    if tasks and all(t["status"] != "todo" for t in tasks):
        return "review"
    if any(t["status"] != "todo" for t in tasks) or running:
        return "build"
    return "plan"


# ---------------------------------------------------------------- files

def read_text(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_iso(s: str) -> float:
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
    except (ValueError, AttributeError):
        return 0.0


class Git:
    """Worktree roots of a project dir, cached for a few seconds."""

    def __init__(self, ttl: float = 10.0):
        self.ttl, self.cache, self.lock = ttl, {}, threading.Lock()

    def _run(self, *args: str, cwd: str) -> str | None:
        try:
            r = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=5)
            return r.stdout if r.returncode == 0 else None
        except (OSError, subprocess.SubprocessError):
            return None

    def _cached(self, key, fn):
        with self.lock:
            hit = self.cache.get(key)
            if hit and time.monotonic() - hit[0] < self.ttl:
                return hit[1]
        val = fn()
        with self.lock:
            self.cache[key] = (time.monotonic(), val)
        return val

    def worktrees(self, d: str) -> list[dict]:
        def load():
            out = self._run("worktree", "list", "--porcelain", cwd=d)
            roots, cur = [], {}
            for line in (out or "").splitlines():
                if line.startswith("worktree "):
                    cur = {"path": line[9:], "branch": None}
                    roots.append(cur)
                elif line.startswith("branch ") and cur:
                    cur["branch"] = line[7:].removeprefix("refs/heads/")
            # git prints resolved paths (/private/var/... on macOS for /var/...).
            if not any(Path(r["path"]).resolve() == Path(d).resolve() for r in roots):
                roots.insert(0, {"path": d, "branch": None})
            return roots
        return self._cached(("wt", d), load)


DOC_PATTERNS = [re.compile(r"^docs/(design|architecture|test-plan)-[a-z0-9][a-z0-9-]*\.md$")]


SAFE_DIR = re.compile(r"[A-Za-z0-9_][A-Za-z0-9_.-]*(/[A-Za-z0-9_][A-Za-z0-9_.-]*)*")


def safe_docs_dir(d: str) -> str:
    """A company's docsDir: relative, no '..' — else nothing is read from it."""
    d = (d or "").strip("/")
    return d if SAFE_DIR.fullmatch(d) and ".." not in d.split("/") else ""


def docs_dir_ok(rel: str, docs_dir: str) -> bool:
    d = safe_docs_dir(docs_dir)
    return bool(d) and bool(re.fullmatch(re.escape(d) + r"/[^/]+\.md", rel))


class Store:
    def __init__(self, home: Path, stale_minutes: float, git: Git):
        self.home, self.stale, self.git = home, stale_minutes * 60, git

    def companies(self) -> list[dict]:
        out = []
        base = self.home / "companies"
        if not base.is_dir():
            return out
        for d in sorted(base.iterdir()):
            raw = read_text(d / "state.json")
            if raw is None:
                continue
            try:
                c = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if isinstance(c, dict) and c.get("schema") == 1 and c.get("id") == d.name:
                out.append(c)
        return out

    def company(self, cid: str) -> dict | None:
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,80}", cid or ""):
            return None
        return next((c for c in self.companies() if c["id"] == cid), None)

    def is_stale(self, c: dict) -> bool:
        return c.get("status") == "open" and time.time() - parse_iso(c.get("updatedAt", "")) > self.stale

    def summary(self, c: dict) -> dict:
        agents = c.get("agents") or []
        return {
            "id": c["id"], "title": c.get("title"), "slug": c.get("slug"), "machine": c.get("machine"),
            "status": c.get("status"), "phase": c.get("phase"), "note": c.get("note"),
            "budget": c.get("budget"), "dashboard": c.get("dashboard"),
            "running": sum(1 for a in agents if a.get("status") == "running"),
            "openQuestions": sum(1 for q in (c.get("questions") or []) if q.get("status") == "open"),
            "updatedAt": c.get("updatedAt"), "openedAt": c.get("openedAt"), "closedAt": c.get("closedAt"),
            "stale": self.is_stale(c),
        }

    def roots(self, c: dict) -> list[dict]:
        d = c.get("dir") or ""
        if not Path(d).is_dir():
            return []
        return self.git.worktrees(d)

    def docs(self, c: dict) -> list[dict]:
        """Every readable plan document of the company: (root index, rel path)."""
        out = []
        for i, r in enumerate(self.roots(c)):
            root = Path(r["path"])
            names = []
            if (root / "docs").is_dir():
                names += [f"docs/{p.name}" for p in sorted((root / "docs").glob("*.md"))]
            dd = safe_docs_dir(c.get("docsDir") or "")
            if dd and (root / dd).is_dir():
                names += [f"{dd}/{p.name}" for p in sorted((root / dd).glob("*.md"))]
            for rel in names:
                if self.allowed(c, rel):
                    p = root / rel
                    out.append({"root": i, "path": rel, "branch": r["branch"], "mtime": p.stat().st_mtime})
        return out

    def allowed(self, c: dict, rel: str) -> bool:
        return any(p.match(rel) for p in DOC_PATTERNS) or docs_dir_ok(rel, c.get("docsDir") or "")

    def doc(self, c: dict, root: int, rel: str) -> str | None:
        roots = self.roots(c)
        if not (0 <= root < len(roots)) or not self.allowed(c, rel) or ".." in rel.split("/"):
            return None
        base = Path(roots[root]["path"]).resolve()
        p = (base / rel).resolve()
        if base not in p.parents:
            return None
        return read_text(p)

    def parts(self, c: dict) -> list[dict]:
        """Parts from docs/design-<part>.md across the dir and its worktrees."""
        roots = self.roots(c)
        found: dict[str, list] = {}
        for i, r in enumerate(roots):
            docs = Path(r["path"]) / "docs"
            for p in sorted(docs.glob("design-*.md")) if docs.is_dir() else []:
                name = p.name[len("design-"):-3]
                if re.fullmatch(r"[a-z0-9][a-z0-9-]*", name):
                    found.setdefault(name, []).append(i)
        agents = c.get("agents") or []
        # A part is done once it passed its tests and the company moved on to
        # integration, or the company closed with a PR. Git ancestry is not
        # used: parts merge into an integration branch, not the dir's HEAD.
        closed = c.get("status") == "closed" and bool((c.get("result") or {}).get("pr"))
        integrating = c.get("phase") in ("integrate", "deliver")
        out = []
        for name, idxs in sorted(found.items()):
            def arch_mtime(i):
                a = Path(roots[i]["path"]) / "docs" / f"architecture-{name}.md"
                return a.stat().st_mtime if a.is_file() else -1
            # Newest architecture doc first; else a branch named after the part;
            # else the project dir itself (design docs on main show up in every worktree).
            best = max(idxs, key=lambda i: (arch_mtime(i), name in (roots[i]["branch"] or "").split("-"), -i))
            root = Path(roots[best]["path"])
            arch = read_text(root / "docs" / f"architecture-{name}.md")
            tplan = read_text(root / "docs" / f"test-plan-{name}.md")
            tasks = parse_tasks(arch or "")
            result = test_result(tplan or "")
            branch = roots[best]["branch"]
            merged = closed or (integrating and result == "PASS")
            running = [a for a in agents if a.get("part") == name and a.get("status") == "running"]
            out.append({
                "name": name, "root": best, "branch": branch, "phase": part_phase(arch is not None, tasks, result, merged, len(running)),
                "tasks": tasks, "result": result, "agents": [a for a in agents if a.get("part") == name][-20:],
                "docs": [{"root": best, "path": f"docs/{k}-{name}.md"} for k in ("design", "architecture", "test-plan")
                         if (root / "docs" / f"{k}-{name}.md").is_file()],
            })
        return out

    def detail(self, c: dict) -> dict:
        return {"company": c, "summary": self.summary(c), "parts": self.parts(c),
                "docs": [{k: d[k] for k in ("root", "path", "branch")} for d in self.docs(c)]}

    def signature(self) -> tuple:
        """Changes when any state file or plan document changes."""
        sig = []
        base = self.home / "companies"
        if base.is_dir():
            for d in sorted(base.iterdir()):
                s = d / "state.json"
                try:
                    sig.append((d.name, s.stat().st_mtime_ns))
                except OSError:
                    continue
        for c in self.companies():
            if c.get("status") != "open":
                continue
            for d in self.docs(c):
                sig.append((c["id"], d["root"], d["path"], d["mtime"]))
        return tuple(sig)


# ---------------------------------------------------------------- server

class Hub:
    """Wakes SSE clients when the signature changes."""

    def __init__(self):
        self.cond, self.version = threading.Condition(), 0

    def bump(self):
        with self.cond:
            self.version += 1
            self.cond.notify_all()

    def wait(self, seen: int, timeout: float) -> int:
        with self.cond:
            self.cond.wait_for(lambda: self.version != seen, timeout=timeout)
            return self.version


def make_handler(store: Store, hub: Hub, port_ref: dict, stop: threading.Event):
    index = (HERE / "index.html").read_bytes()
    marked = (HERE / "vendor" / "marked.min.js").read_bytes()

    class H(BaseHTTPRequestHandler):
        server_version = f"{APP}/{VERSION}"
        protocol_version = "HTTP/1.1"

        def log_message(self, *a):  # quiet
            pass

        def _host_ok(self) -> bool:
            # Loopback only, and no DNS rebinding: the Host must be ours.
            host = self.headers.get("Host", "")
            return host in (f"127.0.0.1:{port_ref['port']}", f"localhost:{port_ref['port']}")

        def _send(self, code: int, body: bytes, ctype: str, extra: dict | None = None):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy",
                             "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def _json(self, obj, code: int = 200):
            self._send(code, json.dumps(obj, ensure_ascii=False).encode(), "application/json; charset=utf-8")

        def do_POST(self):  # read-only server
            self._send(405, b"read-only", "text/plain")

        do_PUT = do_DELETE = do_PATCH = do_POST

        def do_GET(self):
            if not self._host_ok():
                return self._send(403, b"forbidden host", "text/plain")
            u = urlparse(self.path)
            q = parse_qs(u.query)
            parts = [p for p in u.path.split("/") if p]
            if u.path == "/":
                return self._send(200, index, "text/html; charset=utf-8")
            if u.path == "/vendor/marked.min.js":
                return self._send(200, marked, "text/javascript; charset=utf-8")
            if u.path == "/health":
                return self._json({"app": APP, "version": VERSION, "pid": os.getpid()})
            if u.path == "/api/companies":
                cs = [store.summary(c) for c in store.companies()]
                cs.sort(key=lambda s: (s["status"] != "open", -(parse_iso(s.get("updatedAt") or ""))))
                return self._json({"companies": cs, "version": hub.version})
            if len(parts) == 3 and parts[:2] == ["api", "companies"]:
                c = store.company(parts[2])
                return self._json(store.detail(c)) if c else self._json({"error": "not found"}, 404)
            if len(parts) == 4 and parts[:2] == ["api", "companies"] and parts[3] == "doc":
                c = store.company(parts[2])
                try:
                    root = int((q.get("root") or ["0"])[0])
                except ValueError:
                    root = -1
                text = store.doc(c, root, (q.get("path") or [""])[0]) if c else None
                if text is None:
                    return self._json({"error": "not found"}, 404)
                return self._send(200, text.encode(), "text/markdown; charset=utf-8")
            if u.path == "/events":
                return self._events()
            return self._json({"error": "not found"}, 404)

        def _events(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            seen = -1
            try:
                while not stop.is_set():
                    v = hub.wait(seen, 15)
                    if v != seen:
                        self.wfile.write(f"event: change\ndata: {v}\n\n".encode())
                        seen = v
                    else:
                        self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass
            self.close_connection = True

    return H


def pid_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except (OSError, TypeError):
        return False


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--home", default=str(Path.home() / ".claude" / "company-hq"))
    ap.add_argument("--port", type=int, default=0, help="first port to try (default: config.json port, else 7420)")
    ap.add_argument("--idle-minutes", type=float, default=15)
    ap.add_argument("--stale-minutes", type=float, default=10)
    ap.add_argument("--poll", type=float, default=1.0)
    a = ap.parse_args(argv)

    home = Path(a.home).expanduser()
    home.mkdir(parents=True, exist_ok=True)
    info_file = home / "server.json"

    # One server per machine: an alive one wins.
    try:
        info = json.loads(info_file.read_text())
        if pid_alive(int(info.get("pid", 0))) and info.get("app") == APP:
            print(json.dumps(info))
            return 0
    except (OSError, ValueError):
        pass

    cfg = {}
    try:
        cfg = json.loads((home / "config.json").read_text())
    except (OSError, ValueError):
        pass
    first = a.port or int(cfg.get("port") or 7420)

    store, hub, stop = Store(home, a.stale_minutes, Git()), Hub(), threading.Event()
    port_ref = {"port": 0}
    httpd = None
    for port in range(first, first + 11):
        try:
            httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(store, hub, port_ref, stop))
            port_ref["port"] = port
            break
        except OSError:
            continue
    if httpd is None:
        print(f"{APP}: no free port in {first}-{first + 10}", file=sys.stderr)
        return 2
    httpd.daemon_threads = True

    info = {"app": APP, "version": VERSION, "pid": os.getpid(), "port": port_ref["port"],
            "url": f"http://127.0.0.1:{port_ref['port']}/", "startedAt": now_iso()}
    tmp = info_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(info))
    tmp.replace(info_file)
    print(json.dumps(info), flush=True)

    def watch():
        last, idle_since = None, None
        while not stop.is_set():
            try:
                sig = store.signature()
                if sig != last:
                    last = sig
                    hub.bump()
                open_ = [c for c in store.companies() if c.get("status") == "open" and not store.is_stale(c)]
                if open_:
                    idle_since = None
                elif idle_since is None:
                    idle_since = time.monotonic()
                elif time.monotonic() - idle_since > a.idle_minutes * 60:
                    stop.set()
            except Exception as e:  # keep serving; a bad file must not kill the watcher
                print(f"{APP}: watch: {e}", file=sys.stderr)
            stop.wait(a.poll)
        httpd.shutdown()

    for s in (signal.SIGTERM, signal.SIGINT):
        signal.signal(s, lambda *_: stop.set())
    threading.Thread(target=watch, daemon=True).start()
    try:
        httpd.serve_forever(poll_interval=0.5)
    finally:
        hub.bump()
        httpd.server_close()
        try:
            if json.loads(info_file.read_text()).get("pid") == os.getpid():
                info_file.unlink()
        except (OSError, ValueError):
            pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
