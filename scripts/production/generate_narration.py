"""Generate narration audio, word timings and subtitles for every lesson.

For each beat in scripts/narration/lesson-XX.json:
  * synthesises speech with Microsoft Edge neural TTS (edge-tts) —
    voice en-US-ChristopherNeural (mature American male) by default;
  * stores public/audio/narration/lesson-XX/<scene>-<beat>.mp3;
  * records the exact audio duration and per-word boundaries.

Then it writes:
  * src/generated/lesson-XX.timing.json  (consumed by the Remotion timeline)
  * subtitles are built later by build_subtitles.py, once the timeline is known.

Audio is cached: a beat is only re-synthesised when its text, voice or rate change.

Usage:
  python -I scripts/production/generate_narration.py            # all lessons
  python -I scripts/production/generate_narration.py lesson-03  # one lesson
Environment:
  NARRATION_VOICE (default en-US-ChristopherNeural), NARRATION_RATE (default -4%)
"""
import asyncio
import glob
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "scripts" / "narration"
AUDIO = ROOT / "public" / "audio" / "narration"
GENERATED = ROOT / "src" / "generated"

VOICE = os.environ.get("NARRATION_VOICE", "en-US-ChristopherNeural")
RATE = os.environ.get("NARRATION_RATE", "-4%")

# Display text (subtitles) -> spoken text, shared with src/export.ts.
PRONUNCIATION = [(pat, rep.replace("$1", r"\1")) for pat, rep in
                 json.loads((ROOT / "scripts" / "production" / "pronunciation.json").read_text(encoding="utf-8"))["rules"]]


def spoken(text: str) -> str:
    for pat, rep in PRONUNCIATION:
        text = re.sub(pat, rep, text)
    return text


def ffprobe_bin() -> str:
    hits = glob.glob(str(ROOT / "node_modules" / "@remotion" / "compositor-*" / "ffprobe*"))
    hits = [h for h in hits if not h.endswith(".d.ts")]
    if hits:
        return hits[0]
    return "ffprobe"


def duration_of(path: pathlib.Path) -> float:
    out = subprocess.run([ffprobe_bin(), "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(f"ffprobe failed for {path}: {out.stderr}")
    return float(out.stdout.strip())


async def synth(text: str, out_path: pathlib.Path):
    comm = edge_tts.Communicate(spoken(text), VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    audio = bytearray()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            words.append({"t": round(chunk["offset"] / 1e7, 3),
                          "d": round(chunk["duration"] / 1e7, 3),
                          "w": chunk["text"]})
    if not audio:
        raise RuntimeError(f"No audio received for: {text[:60]}")
    out_path.write_bytes(bytes(audio))
    return words


async def process(lesson_path: pathlib.Path):
    lesson = json.loads(lesson_path.read_text(encoding="utf-8"))
    lid = lesson["id"]
    out_dir = AUDIO / lid
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_file = out_dir / "cache.json"
    cache = json.loads(cache_file.read_text(encoding="utf-8")) if cache_file.exists() else {}
    timing = {"lesson": lid, "voice": VOICE, "rate": RATE, "beats": {}}
    used = set()
    for scene in lesson["scenes"]:
        for i, beat in enumerate(scene["beats"]):
            key = f"{scene['id']}-{i}"
            fname = f"{key}.mp3"
            used.add(fname)
            path = out_dir / fname
            digest = hashlib.sha1(f"{VOICE}|{RATE}|{spoken(beat['text'])}".encode()).hexdigest()
            entry = cache.get(key)
            if not (entry and entry.get("hash") == digest and path.exists()):
                for attempt in range(4):
                    try:
                        words = await synth(beat["text"], path)
                        break
                    except Exception as exc:  # network hiccups
                        if attempt == 3:
                            raise
                        print(f"    retry {key}: {exc}")
                        await asyncio.sleep(2 + attempt * 3)
                entry = {"hash": digest, "words": words, "duration": duration_of(path)}
                cache[key] = entry
                print(f"  {lid} {key:<28} {entry['duration']:6.2f}s  (new)")
            timing["beats"][key] = {"file": f"audio/narration/{lid}/{fname}",
                                    "duration": entry["duration"], "words": entry["words"]}
    # remove stale audio
    for f in out_dir.glob("*.mp3"):
        if f.name not in used:
            f.unlink()
    cache = {k: v for k, v in cache.items() if f"{k}.mp3" in used}
    cache_file.write_text(json.dumps(cache, indent=1), encoding="utf-8")
    GENERATED.mkdir(parents=True, exist_ok=True)
    (GENERATED / f"{lid}.timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    total = sum(b["duration"] for b in timing["beats"].values())
    print(f"{lid}: {len(timing['beats'])} beats, {total/60:.1f} min of narration")


async def main(args):
    files = sorted(SCRIPTS.glob("lesson-*.json"))
    if args:
        files = [f for f in files if f.stem in args]
    if not files:
        print("No lesson scripts matched", args)
        return 1
    for f in files:
        await process(f)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv[1:])))
