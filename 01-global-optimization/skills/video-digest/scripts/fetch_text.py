#!/usr/bin/env python3
"""URL or local file -> timestamped transcript.

Order: manual subtitles -> auto subtitles -> Parakeet -> Whisper.
Writes transcript.txt and meta.json into --out and prints meta as JSON on stdout.
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time

PARAKEET_MODEL = "mlx-community/parakeet-tdt-0.6b-v3"
WHISPER_MODEL = "mlx-community/whisper-large-v3-turbo"
# Languages of Parakeet TDT v3; anything else goes straight to Whisper.
PARAKEET_LANGS = {
    "bg", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "hu", "it",
    "lv", "lt", "mt", "pl", "pt", "ro", "sk", "sl", "es", "sv", "ru", "uk",
}
BLOCK_SECONDS = 30


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed ({r.returncode}): {r.stderr.strip()[-800:]}")
    return r.stdout


def ts(sec):
    sec = int(sec)
    h, m, s = sec // 3600, sec % 3600 // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def to_blocks(segments, chapters=()):
    """[(start, text)] -> lines "[mm:ss] text", grouped into ~30 s blocks.
    Inserts a "## [mm:ss] Title" line before each chapter."""
    lines, cur_start, cur = [], None, []
    pending = sorted(chapters, key=lambda c: c["start"])
    for start, text in segments:
        if pending and start >= pending[0]["start"]:
            if cur:
                lines.append(f"[{ts(cur_start)}] {' '.join(cur)}")
                cur_start, cur = None, []
            while pending and start >= pending[0]["start"]:
                ch = pending.pop(0)
                lines.append(f"## [{ts(ch['start'])}] {ch['title']}")
        if cur_start is None:
            cur_start = start
        if start - cur_start >= BLOCK_SECONDS and cur:
            lines.append(f"[{ts(cur_start)}] {' '.join(cur)}")
            cur_start, cur = start, []
        cur.append(text)
    if cur:
        lines.append(f"[{ts(cur_start)}] {' '.join(cur)}")
    return "\n\n".join(lines) + "\n"


def parse_vtt(path):
    """VTT -> [(start, text)]. YouTube auto captions repeat the previous line
    in every cue, so only new lines are kept."""
    segments, seen_last = [], None
    cue_re = re.compile(r"^(\d+):(\d\d):(\d\d)\.\d+\s+-->")
    start = None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            m = cue_re.match(line)
            if m:
                start = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])
                continue
            if not line or start is None or line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
                continue
            text = re.sub(r"<[^>]+>", "", line).strip()
            text = text.replace("&amp;", "&").replace("&gt;", ">").replace("&lt;", "<").replace("&nbsp;", " ")
            if not text or text == seen_last:
                continue
            seen_last = text
            segments.append((start, text))
    return segments


def pick_sub_lang(info, wanted):
    """Return (lang, auto) for the best available track, or (None, None)."""
    orig = (info.get("language") or "").split("-")[0] or None
    manual = info.get("subtitles") or {}
    auto = info.get("automatic_captions") or {}
    order = [l for l in (wanted, orig, "en") if l]

    def find(tracks, lang):
        for key in tracks:
            if key == lang or key.startswith(lang + "-"):
                if key == "live_chat":
                    continue
                return key
        return None

    for lang in order:
        key = find(manual, lang)
        if key:
            return key, False
    # For auto captions YouTube marks the spoken language "<lang>-orig"; the rest are machine translations.
    if orig and f"{orig}-orig" in auto:
        return f"{orig}-orig", True
    for lang in order:
        if lang in auto:
            return lang, True
    return None, None


def from_subtitles(url, info, out, wanted):
    lang, is_auto = pick_sub_lang(info, wanted)
    if not lang:
        return None
    log(f"subtitles: {lang} ({'auto' if is_auto else 'manual'})")
    flag = "--write-auto-subs" if is_auto else "--write-subs"
    run(["yt-dlp", "--no-playlist", "--skip-download", flag, "--sub-langs", lang, "--sub-format", "vtt",
         "-o", os.path.join(out, "subs.%(ext)s"), url])
    files = glob.glob(os.path.join(out, "subs*.vtt"))
    if not files:
        return None
    segments = parse_vtt(files[0])
    if not segments:
        return None
    return segments, ("subtitles-auto" if is_auto else "subtitles-manual"), lang.split("-")[0]


def to_wav(src, out):
    wav = os.path.join(out, "audio.wav")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vn", "-ac", "1", "-ar", "16000", wav])
    return wav


def download_audio(url, out):
    run(["yt-dlp", "--no-playlist", "-f", "bestaudio/best", "-x", "-o", os.path.join(out, "audio_src.%(ext)s"), url])
    files = [f for f in glob.glob(os.path.join(out, "audio_src.*")) if not f.endswith(".part")]
    if not files:
        raise RuntimeError("yt-dlp did not produce an audio file")
    return files[0]


def asr_parakeet(wav, out):
    run(["parakeet-mlx", wav, "--model", PARAKEET_MODEL, "--output-format", "json",
         "--output-dir", out, "--output-template", "parakeet"])
    with open(os.path.join(out, "parakeet.json"), encoding="utf-8") as f:
        data = json.load(f)
    return [(s["start"], s["text"].strip()) for s in data["sentences"] if s["text"].strip()]


def asr_whisper(wav, out, lang):
    cmd = ["mlx_whisper", wav, "--model", WHISPER_MODEL, "--output-format", "json",
           "--output-dir", out, "--output-name", "whisper"]
    if lang:
        cmd += ["--language", lang]
    run(cmd)
    with open(os.path.join(out, "whisper.json"), encoding="utf-8") as f:
        data = json.load(f)
    return [(s["start"], s["text"].strip()) for s in data["segments"] if s["text"].strip()], data.get("language")


def media_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out.strip() or 0)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", help="URL (anything yt-dlp supports) or path to an audio/video file")
    ap.add_argument("--out", required=True, help="output directory")
    ap.add_argument("--lang", help="spoken language (en, de, ...), if known")
    ap.add_argument("--engine", choices=["auto", "subs", "parakeet", "whisper"], default="auto",
                    help="auto = subtitles, then Parakeet/Whisper; subs = subtitles only")
    ap.add_argument("--keep-audio", action="store_true")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    t0 = time.time()
    is_file = os.path.exists(args.source)
    meta = {"source": args.source}

    if is_file:
        src = os.path.abspath(args.source)
        meta.update(title=os.path.splitext(os.path.basename(src))[0], url=f"local:{os.path.basename(src)}",
                    duration=media_duration(src))
        info = {}
    else:
        info = json.loads(run(["yt-dlp", "--dump-single-json", "--no-playlist", "--skip-download", args.source]))
        upload = info.get("upload_date") or ""
        meta.update(title=info.get("title"), url=info.get("webpage_url") or args.source,
                    author=info.get("channel") or info.get("uploader"),
                    published=f"{upload[:4]}-{upload[4:6]}-{upload[6:]}" if len(upload) == 8 else None,
                    duration=info.get("duration"), language=(info.get("language") or "").split("-")[0] or None,
                    # The description gives correct spelling of names and terms; chapters give structure.
                    description=(info.get("description") or "")[:4000] or None,
                    chapters=[{"start": int(c["start_time"]), "title": c["title"]}
                              for c in info.get("chapters") or []] or None)

    lang = args.lang or meta.get("language")
    result = None
    if not is_file and args.engine in ("auto", "subs"):
        result = from_subtitles(args.source, info, args.out, args.lang)
        if not result and args.engine == "subs":
            raise SystemExit("no subtitles available")

    if not result:
        audio = args.source if is_file else download_audio(args.source, args.out)
        wav = to_wav(audio, args.out)
        engine = args.engine
        if engine == "auto":
            engine = "parakeet" if (lang is None or lang in PARAKEET_LANGS) else "whisper"
        t_asr = time.time()
        log(f"asr: {engine}")
        if engine == "parakeet":
            result = (asr_parakeet(wav, args.out), "parakeet", lang)
        else:
            segments, detected = asr_whisper(wav, args.out, lang)
            result = (segments, "whisper", lang or detected)
        meta["asr_seconds"] = round(time.time() - t_asr, 1)
        if not args.keep_audio:
            for f in [wav] + ([] if is_file else [audio]):
                os.remove(f)

    segments, method, lang = result
    text = to_blocks(segments, meta.get("chapters") or ())
    path = os.path.join(args.out, "transcript.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

    if meta.get("duration"):
        meta["duration_hms"] = ts(meta["duration"])
    meta.update(transcript=path, transcript_source=method, language=lang,
                words=len(text.split()), elapsed_seconds=round(time.time() - t0, 1))
    with open(os.path.join(args.out, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    for tool in ("yt-dlp", "ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise SystemExit(f"missing {tool}: brew install yt-dlp ffmpeg deno")
    main()
