"""Tests for company-dashboard.py:  python3 -m unittest -v test_company_dashboard  (from this folder)"""
import http.client
import importlib.util
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("cd", HERE / "company-dashboard.py")
cd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cd)

ARCH = """# Architecture: api

Some text.

## Tasks
- [ ] T1 Payment model and migration
- [x] T2 Refund endpoint
- [x] T3 Webhook handler {verified}
- [x] T4 Idempotency keys {rejected: no test for a duplicate webhook}
- [ ] T5 Retry on 5xx {added}
- not a task line
- [x] T6 Late addition {added} {verified}

## Notes
- [ ] T9 not under Tasks
"""


class Parse(unittest.TestCase):
    def test_tasks(self):
        t = cd.parse_tasks(ARCH)
        self.assertEqual([x["id"] for x in t], ["T1", "T2", "T3", "T4", "T5", "T6"])
        self.assertEqual([x["status"] for x in t], ["todo", "done", "verified", "rejected", "todo", "verified"])
        self.assertEqual(t[3]["reason"], "no test for a duplicate webhook")
        self.assertEqual(t[3]["title"], "Idempotency keys")
        self.assertTrue(t[4]["added"] and t[5]["added"])
        self.assertEqual(t[5]["title"], "Late addition")

    def test_marks_on_unticked_task_are_not_trusted(self):
        t = cd.parse_tasks("## Tasks\n- [ ] T1 x {verified}\n")
        self.assertEqual(t[0]["status"], "todo")

    def test_result(self):
        self.assertEqual(cd.test_result("# Test plan\nResult: PASS 2026-10-08\n"), "PASS")
        self.assertEqual(cd.test_result("# T\nResult: FAIL 2026-10-08 — flaky\n"), "FAIL")
        self.assertIsNone(cd.test_result("# T\nno result\n"))

    def test_phase(self):
        T = lambda *s: [{"status": x} for x in s]
        P = cd.part_phase
        self.assertEqual(P(False, [], None, False, 0), "plan")
        self.assertEqual(P(True, T("todo", "todo"), None, False, 0), "plan")
        self.assertEqual(P(True, T("todo"), None, False, 1), "build")
        self.assertEqual(P(True, T("done", "todo"), None, False, 0), "build")
        self.assertEqual(P(True, T("done", "verified"), None, False, 0), "review")
        self.assertEqual(P(True, T("verified", "verified"), None, False, 0), "test")
        self.assertEqual(P(True, T("verified", "rejected"), None, False, 0), "build")
        self.assertEqual(P(True, T("verified"), "FAIL", False, 0), "build")
        self.assertEqual(P(True, T("verified"), "PASS", False, 0), "test")
        self.assertEqual(P(True, T("rejected"), None, True, 0), "done")


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def git(*a, cwd):
    subprocess.run(["git", *a], cwd=cwd, check=True, capture_output=True,
                   env={**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@t", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@t"})


class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name)
        cls.home = root / "hq"
        proj = root / "proj"
        (proj / "docs").mkdir(parents=True)
        (proj / "claudedocs/company/pay").mkdir(parents=True)
        (proj / "claudedocs/company/pay/plan.md").write_text("# Plan\n\n<script>alert(1)</script>\n")
        (proj / "docs/design-api.md").write_text("# api design\n")
        (proj / "docs/design-ui.md").write_text("# ui design\n")
        (proj / "secret.md").write_text("TOP SECRET\n")
        git("init", "-q", "-b", "main", cwd=proj)
        git("add", "-A", cwd=proj)
        git("commit", "-q", "-m", "init", cwd=proj)
        # Part api works in its own worktree, with tasks and a test result.
        wt = root / "wt-api"
        git("worktree", "add", "-q", "-b", "company-pay-api", str(wt), cwd=proj)
        (wt / "docs/architecture-api.md").write_text(ARCH)
        (wt / "docs/test-plan-api.md").write_text("# Test plan api\n")
        cls.proj, cls.wt = proj, wt

        now = cd.now_iso()
        cls.cid = "pay-20261008-143012"
        c = {"schema": 1, "id": cls.cid, "slug": "pay", "title": "Pay", "task": "add payments", "kind": "code",
             "machine": "laptop", "sessionId": "s1", "dir": str(proj), "docsDir": "claudedocs/company/pay",
             "dashboard": "local", "status": "open", "phase": "execute", "note": "", "budget": {"capUsd": 25, "spentUsd": 3},
             "teams": [], "agents": [{"agentId": "a1", "type": "workflow-subagent", "part": "ui", "description": "ui: x",
                                      "status": "running", "startedAt": now}],
             "questions": [{"id": "q1", "status": "open", "text": "Which PSP?"}], "decisions": [],
             "result": {}, "seq": 1, "openedAt": now, "updatedAt": now, "closedAt": None}
        d = cls.home / "companies" / cls.cid
        d.mkdir(parents=True)
        (d / "state.json").write_text(json.dumps(c))
        (d / "private.json").write_text(json.dumps({"hires": {"x": {"prompt": "SYSTEM PROMPT"}}}))
        cls.state = c

        cls.port = free_port()
        cls.proc = subprocess.Popen([sys.executable, str(HERE / "company-dashboard.py"), "--home", str(cls.home),
                                     "--port", str(cls.port), "--poll", "0.2"],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            if (cls.home / "server.json").exists():
                break
            time.sleep(0.1)
        cls.info = json.loads((cls.home / "server.json").read_text())

    @classmethod
    def tearDownClass(cls):
        if cls.proc.poll() is None:
            cls.proc.terminate()
            cls.proc.wait(5)
        cls.tmp.cleanup()

    def req(self, path, host=None, method="GET"):
        c = http.client.HTTPConnection("127.0.0.1", self.info["port"], timeout=5)
        c.request(method, path, headers={"Host": host or f"127.0.0.1:{self.info['port']}"})
        r = c.getresponse()
        body = r.read().decode()
        c.close()
        return r.status, body

    def test_health_and_info(self):
        self.assertEqual(self.info["port"], self.port)
        s, b = self.req("/health")
        self.assertEqual(s, 200)
        self.assertEqual(json.loads(b)["app"], "company-dashboard")

    def test_list(self):
        s, b = self.req("/api/companies")
        cs = json.loads(b)["companies"]
        self.assertEqual([c["id"] for c in cs], [self.cid])
        self.assertEqual(cs[0]["running"], 1)
        self.assertEqual(cs[0]["openQuestions"], 1)
        self.assertFalse(cs[0]["stale"])

    def test_parts_from_dir_and_worktree(self):
        s, b = self.req(f"/api/companies/{self.cid}")
        d = json.loads(b)
        parts = {p["name"]: p for p in d["parts"]}
        self.assertEqual(sorted(parts), ["api", "ui"])
        self.assertEqual(parts["api"]["branch"], "company-pay-api")
        self.assertEqual(parts["api"]["phase"], "build")  # T4 rejected
        self.assertEqual(len(parts["api"]["tasks"]), 6)
        self.assertEqual(parts["ui"]["phase"], "build")  # an agent runs on it
        self.assertEqual(parts["ui"]["branch"], "main")  # design on main only: the project dir, not the api worktree
        paths = [(x["root"], x["path"]) for x in d["docs"]]
        self.assertEqual(len(paths), len(set(paths)))
        self.assertEqual(sum(1 for x in d["docs"] if x["path"] == "docs/design-ui.md"), 2)  # project dir + api worktree
        self.assertNotIn("SYSTEM PROMPT", b)

    def test_done_after_pass_and_integrate(self):
        tp = self.wt / "docs/test-plan-api.md"
        arch = self.wt / "docs/architecture-api.md"
        sf = self.home / "companies" / self.cid / "state.json"
        old_tp, old_arch, old_state = tp.read_text(), arch.read_text(), sf.read_text()
        try:
            arch.write_text("## Tasks\n- [x] T1 a {verified}\n")
            tp.write_text("# Test plan\nResult: PASS 2026-10-08\n")
            phase = lambda: {p["name"]: p for p in json.loads(self.req(f"/api/companies/{self.cid}")[1])["parts"]}["api"]["phase"]
            self.assertEqual(phase(), "test")
            sf.write_text(json.dumps(dict(json.loads(old_state), phase="integrate")))
            self.assertEqual(phase(), "done")
        finally:
            tp.write_text(old_tp); arch.write_text(old_arch); sf.write_text(old_state)

    def test_docs_and_traversal(self):
        s, b = self.req(f"/api/companies/{self.cid}/doc?root=0&path=claudedocs/company/pay/plan.md")
        self.assertEqual(s, 200)
        self.assertIn("<script>", b)  # served as markdown text; the page escapes raw HTML
        for bad in ["secret.md", "docs/../secret.md", "../hq/companies/x/private.json", "docs/design-api.md/../../secret.md"]:
            s, _ = self.req(f"/api/companies/{self.cid}/doc?root=0&path={bad}")
            self.assertEqual(s, 404, bad)
        s, _ = self.req(f"/api/companies/{self.cid}/doc?root=9&path=docs/design-api.md")
        self.assertEqual(s, 404)
        s, _ = self.req("/api/companies/..%2F..%2Fetc")
        self.assertEqual(s, 404)

    def test_unsafe_docs_dir_is_ignored(self):
        self.assertEqual(cd.safe_docs_dir("claudedocs/company/pay"), "claudedocs/company/pay")
        self.assertEqual(cd.safe_docs_dir("../../hq"), "")
        self.assertEqual(cd.safe_docs_dir("docs/../.."), "")
        self.assertFalse(cd.docs_dir_ok("../../hq/companies/x/private.json", "../../hq"))
        self.assertEqual(self.req("/shutdown")[0], 404)  # no state-changing GET

    def test_host_header_and_methods(self):
        self.assertEqual(self.req("/api/companies", host="evil.example:80")[0], 403)
        self.assertEqual(self.req("/api/companies", method="POST")[0], 405)

    def test_sse_change_on_state_write(self):
        c = http.client.HTTPConnection("127.0.0.1", self.info["port"], timeout=5)
        c.request("GET", "/events", headers={"Host": f"127.0.0.1:{self.info['port']}"})
        r = c.getresponse()
        first = r.fp.readline().decode()
        self.assertTrue(first.startswith("event: change"))
        r.fp.readline(); r.fp.readline()
        st = dict(self.state, phase="integrate", seq=2, updatedAt=cd.now_iso())
        time.sleep(0.05)
        (self.home / "companies" / self.cid / "state.json").write_text(json.dumps(st))
        line = r.fp.readline().decode()
        while line.startswith(":") or not line.strip():
            line = r.fp.readline().decode()
        self.assertTrue(line.startswith("event: change"))
        c.close()

    def test_second_start_reuses_running_server(self):
        out = subprocess.run([sys.executable, str(HERE / "company-dashboard.py"), "--home", str(self.home)],
                             capture_output=True, text=True, timeout=10)
        self.assertEqual(out.returncode, 0)
        self.assertEqual(json.loads(out.stdout)["pid"], self.proc.pid)


class IdleStop(unittest.TestCase):
    def test_stops_without_open_companies(self):
        with tempfile.TemporaryDirectory() as t:
            home = Path(t)
            p = subprocess.Popen([sys.executable, str(HERE / "company-dashboard.py"), "--home", t, "--port", str(free_port()),
                                  "--poll", "0.1", "--idle-minutes", "0.01"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                self.assertEqual(p.wait(10), 0)
            finally:
                if p.poll() is None:
                    p.kill()
            self.assertFalse((home / "server.json").exists())


if __name__ == "__main__":
    unittest.main()
