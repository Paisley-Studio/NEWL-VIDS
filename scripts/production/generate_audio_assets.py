"""Synthesise original background music and sound effects.

Everything here is generated mathematically (numpy) — no samples, loops or
third-party recordings are used — so the resulting audio is original work owned
by the project, with no licensing restrictions. See resources/audio-credits.md.

Outputs
  public/audio/music/lesson-0N.mp3   seamless ~3 minute ambient-corporate loop per lesson
  public/audio/sfx/*.wav             short interface sounds

Usage:  python -I scripts/production/generate_audio_assets.py [--force]
"""
import glob
import pathlib
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]
MUSIC = ROOT / "public" / "audio" / "music"
SFX = ROOT / "public" / "audio" / "sfx"
SR = 44100
RNG = np.random.default_rng(20261112)


def ffmpeg_bin() -> str:
    hits = [h for h in glob.glob(str(ROOT / "node_modules" / "@remotion" / "compositor-*" / "ffmpeg*"))
            if not h.endswith(".d.ts")]
    return hits[0] if hits else "ffmpeg"


def write_wav(path: pathlib.Path, stereo: np.ndarray):
    stereo = np.clip(stereo, -1, 1)
    data = (stereo * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def smooth(x: np.ndarray, width: int) -> np.ndarray:
    """Cheap low-pass: moving average along axis 0."""
    if width <= 1:
        return x
    k = np.ones(width) / width
    if x.ndim == 1:
        return np.convolve(x, k, mode="same")
    return np.stack([np.convolve(x[:, c], k, mode="same") for c in range(x.shape[1])], axis=1)


def env_adsr(n, a, r, sustain_end):
    """Attack a sec, hold until sustain_end sec, release r sec (all in samples domain)."""
    t = np.arange(n) / SR
    e = np.clip(t / max(a, 1e-4), 0, 1)
    rel = np.clip(1 - (t - sustain_end) / max(r, 1e-4), 0, 1)
    e = np.minimum(e, np.where(t > sustain_end, rel, 1.0))
    return e ** 1.5


# ---------------------------------------------------------------- music ----
# Chord voicings as MIDI note lists, root for the bass.
LESSON_MUSIC = {
    "lesson-01": dict(bpm=84, chords=[([62, 66, 69, 73, 76], 38), ([59, 62, 66, 69, 73], 35), ([55, 62, 66, 71, 74], 31), ([57, 62, 64, 69, 76], 33)]),
    "lesson-02": dict(bpm=88, chords=[([64, 68, 71, 75, 78], 40), ([61, 64, 68, 71, 75], 37), ([57, 64, 68, 71, 76], 33), ([59, 64, 66, 68, 75], 35)]),
    "lesson-03": dict(bpm=92, chords=[([60, 65, 69, 72, 76], 41), ([62, 65, 69, 72, 76], 38), ([58, 65, 69, 74, 77], 34), ([60, 65, 67, 70, 74], 36)]),
    "lesson-04": dict(bpm=80, chords=[([60, 63, 67, 70, 74], 36), ([56, 63, 67, 72, 75], 32), ([58, 63, 67, 70, 74], 39), ([58, 62, 65, 67, 72], 34)]),
    "lesson-05": dict(bpm=86, chords=[([62, 67, 71, 74, 78], 43), ([59, 64, 67, 71, 74], 40), ([60, 64, 67, 71, 76], 36), ([62, 64, 66, 69, 74], 38)]),
    "lesson-06": dict(bpm=82, chords=[([61, 64, 68, 71, 76], 45), ([61, 64, 66, 69, 73], 42), ([62, 66, 69, 73, 78], 38), ([59, 64, 66, 68, 71], 40)]),
}


def pad_note(freq, n, seg_end):
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for v, (cents, pan) in enumerate([(-7, 0.25), (6, 0.75)]):
        f = freq * 2 ** (cents / 1200)
        phase = RNG.uniform(0, 2 * np.pi)
        sig = np.zeros(n)
        for h in range(1, 6):
            sig += np.sin(2 * np.pi * f * h * t + phase * h) / h ** 1.7
        lfo = 0.85 + 0.15 * np.sin(2 * np.pi * (0.11 + 0.03 * v) * t + phase)
        sig *= lfo
        out[:, 0] += sig * (1 - pan)
        out[:, 1] += sig * pan
    return out * env_adsr(n, 1.6, 2.4, seg_end)[:, None]


def pluck(freq, n):
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) + 0.12 * np.sin(2 * np.pi * 3 * freq * t)
    e = np.minimum(t / 0.006, 1) * np.exp(-t / 0.28)
    return sig * e


def reverb(x: np.ndarray) -> np.ndarray:
    taps = [0.029, 0.041, 0.053, 0.071, 0.089, 0.113, 0.149, 0.199, 0.263, 0.331, 0.419, 0.53]
    out = np.zeros_like(x)
    for k, d in enumerate(taps):
        s = int(d * SR)
        g = 0.55 * 0.82 ** k
        src = x[:, k % 2]
        dst = (k + 1) % 2
        out[s:, dst] += src[:-s] * g
    return smooth(out, 9)


def render_music(spec, loops=8):
    beat = 60.0 / spec["bpm"]
    chord_len = 8 * beat
    prog_len = chord_len * len(spec["chords"])
    total = prog_len * loops
    n_total = int(total * SR)
    tail = int(6 * SR)
    buf = np.zeros((n_total + tail, 2))
    arp = np.zeros(n_total + tail)
    bass = np.zeros(n_total + tail)
    hats = np.zeros(n_total + tail)
    seg_n = int((chord_len + 3.5) * SR)
    for loop in range(loops):
        for ci, (notes, root) in enumerate(spec["chords"]):
            start = int((loop * prog_len + ci * chord_len) * SR)
            for m in notes:
                buf[start:start + seg_n] += pad_note(mtof(m), seg_n, chord_len) * 0.06
            # bass on beats 1 and 5 of the two-bar chord
            for b in (0, 4):
                s = start + int(b * beat * SR)
                nb = int(3.2 * beat * SR)
                tb = np.arange(nb) / SR
                f = mtof(root)
                bass[s:s + nb] += (np.sin(2 * np.pi * f * tb) + 0.25 * np.sin(4 * np.pi * f * tb)) * env_adsr(nb, 0.04, 0.6, 2.6 * beat) * 0.16
            # eighth-note arpeggio, upper octave
            pattern = [0, 2, 4, 3, 1, 3, 2, 4]
            for e in range(16):
                s = start + int(e * beat / 2 * SR)
                note = notes[pattern[e % 8]] + 12
                nn = int(0.9 * SR)
                vel = 0.55 + 0.45 * ((e % 4) == 0)
                arp[s:s + nn] += pluck(mtof(note), nn) * 0.045 * vel
            # soft off-beat ticks
            for e in range(8):
                s = start + int((e + 0.5) * beat * SR)
                nn = int(0.06 * SR)
                noise = np.diff(RNG.standard_normal(nn + 1))
                hats[s:s + nn] += noise * np.exp(-np.arange(nn) / SR / 0.012) * 0.012
    # slow arrangement swell across the loop so it breathes (periodic => seamless)
    tt = np.arange(n_total + tail) / SR
    swell = 0.55 + 0.45 * (0.5 - 0.5 * np.cos(2 * np.pi * tt / total))
    arp *= swell
    hats *= swell
    pan = 0.5 + 0.35 * np.sin(2 * np.pi * tt / (beat * 4))
    stereo_arp = np.stack([arp * (1 - pan), arp * pan], axis=1)
    mix = buf + stereo_arp + bass[:, None] * 0.7 + hats[:, None]
    mix = mix + reverb(buf * 0.6 + stereo_arp) * 0.7
    # fold the tail into the head so the loop is seamless
    mix[:tail] += mix[n_total:n_total + tail]
    mix = mix[:n_total]
    mix = smooth(mix, 3)
    mix /= np.max(np.abs(mix)) + 1e-9
    return mix * 0.8


# ------------------------------------------------------------------ sfx ----
def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def to_stereo(x, width=0.0):
    return np.stack([x * (1 - width), x * (1 + width)], axis=1) / (1 + abs(width))


def norm(x, peak=0.8):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def bell(freq, sec, decay):
    t = t_axis(sec)
    partials = [(1, 1.0), (2.01, 0.35), (2.76, 0.18), (5.4, 0.06)]
    s = sum(a * np.sin(2 * np.pi * freq * p * t) * np.exp(-t / (decay / p ** 0.5)) for p, a in partials)
    return s * np.minimum(t / 0.004, 1)


def sfx_set():
    out = {}
    # soft UI click
    t = t_axis(0.09)
    click = np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.006) * 0.6 + smooth(RNG.standard_normal(len(t)), 3) * np.exp(-t / 0.004) * 0.5
    click += np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018) * 0.5
    out["click"] = to_stereo(norm(click, 0.55))
    # pop (highlight / callout)
    t = t_axis(0.18)
    f = 520 + 380 * np.exp(-t / 0.03)
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045)
    out["pop"] = to_stereo(norm(pop, 0.35))
    # typing bed: 6 seconds of soft key ticks
    n = int(6 * SR)
    typing = np.zeros(n)
    pos = 0
    while pos < n - 3000:
        ln = int(0.035 * SR)
        tt = np.arange(ln) / SR
        tone = RNG.uniform(1800, 3200)
        k = (np.diff(RNG.standard_normal(ln + 1)) * 0.6 + np.sin(2 * np.pi * tone * tt) * 0.3) * np.exp(-tt / 0.007)
        k += np.sin(2 * np.pi * RNG.uniform(140, 220) * tt) * np.exp(-tt / 0.012) * 0.5
        typing[pos:pos + ln] += k * RNG.uniform(0.55, 1.0)
        pos += int(RNG.uniform(0.055, 0.12) * SR)
    out["typing"] = to_stereo(norm(smooth(typing, 2), 0.3))
    # whoosh (scene transitions)
    t = t_axis(0.9)
    noise = RNG.standard_normal(len(t))
    env = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2
    low = smooth(noise, 40)
    high = noise - smooth(noise, 6)
    sweep = np.clip(t / 0.9, 0, 1)
    wh = (low * (1 - sweep) * 3 + high * sweep * 0.4) * env
    out["whoosh"] = np.stack([wh * (1 - sweep * 0.6), wh * (0.4 + sweep * 0.6)], axis=1)
    out["whoosh"] = norm(out["whoosh"], 0.32)
    out["whoosh-soft"] = norm(out["whoosh"], 0.18)
    # notification chime
    ch = np.zeros(int(1.6 * SR))
    b1 = bell(1318.5, 1.6, 0.5)
    b2 = bell(1975.5, 1.4, 0.45)
    ch += b1
    ch[int(0.11 * SR):int(0.11 * SR) + len(b2)] += b2 * 0.8
    out["chime"] = to_stereo(norm(ch, 0.4), 0.15)
    # sms delivery: three quick ascending blips
    sm = np.zeros(int(0.7 * SR))
    for i, f in enumerate([880, 1175, 1568]):
        s = int(i * 0.085 * SR)
        tt = t_axis(0.25)
        blip = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.06) * np.minimum(tt / 0.003, 1)
        sm[s:s + len(blip)] += blip
    out["sms"] = to_stereo(norm(sm, 0.33), -0.1)
    # success / confirm: soft major arpeggio
    su = np.zeros(int(1.2 * SR))
    for i, f in enumerate([659.3, 830.6, 987.8]):
        s = int(i * 0.07 * SR)
        b = bell(f, 1.0, 0.35)
        su[s:s + len(b)] += b
    out["success"] = to_stereo(norm(su, 0.33))
    # login confirmation: two-tone unlock with shimmer
    lg = np.zeros(int(1.3 * SR))
    b = bell(783.99, 1.1, 0.4)
    lg[:len(b)] += b
    b = bell(1174.7, 1.0, 0.45)
    s = int(0.12 * SR)
    lg[s:s + len(b)] += b * 0.9
    out["login"] = to_stereo(norm(lg, 0.33), 0.1)
    # data processing blips
    da = np.zeros(int(0.9 * SR))
    for i in range(9):
        s = int(i * 0.07 * SR)
        f = RNG.choice([1760, 2093, 2349, 2637, 3136])
        tt = t_axis(0.05)
        blip = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.012)
        da[s:s + len(blip)] += blip * (0.6 + 0.4 * (i % 2))
    out["data"] = to_stereo(norm(da, 0.18), 0.2)
    # riser for openings (3.5 s)
    t = t_axis(3.5)
    noise = RNG.standard_normal(len(t))
    prog = (t / 3.5) ** 2
    hp = noise - smooth(noise, 12)
    tone = np.sin(2 * np.pi * np.cumsum(180 + 520 * prog) / SR) * 0.35
    ri = (smooth(noise, 30) * (1 - prog) * 2 + hp * prog * 0.8 + tone) * prog
    out["riser"] = to_stereo(norm(ri, 0.3))
    # cinematic impact (low boom + air)
    t = t_axis(3.0)
    f = 38 + 60 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    air = smooth(RNG.standard_normal(len(t)), 20) * np.exp(-t / 0.5) * 0.6
    im = boom + air
    im = im + np.concatenate([np.zeros(int(0.06 * SR)), im[:-int(0.06 * SR)]]) * 0.25
    out["impact"] = to_stereo(norm(im, 0.6))
    # shimmer sparkle (logo reveal)
    t = t_axis(2.8)
    sh = np.zeros(len(t))
    for _ in range(26):
        s = int(RNG.uniform(0, 1.6) * SR)
        f = RNG.choice([2093, 2637, 3136, 3520, 4186])
        b = bell(f, 1.2, 0.25) * RNG.uniform(0.2, 0.6)
        e = min(len(b), len(sh) - s)
        sh[s:s + e] += b[:e]
    sh *= np.minimum(t / 0.3, 1)
    out["shimmer"] = np.stack([sh, np.roll(sh, int(0.013 * SR))], axis=1)
    out["shimmer"] = norm(out["shimmer"], 0.22)
    return out


def main(force: bool):
    MUSIC.mkdir(parents=True, exist_ok=True)
    SFX.mkdir(parents=True, exist_ok=True)
    for name, data in sfx_set().items():
        path = SFX / f"{name}.wav"
        if force or not path.exists():
            write_wav(path, data)
            print("sfx  ", path.name)
    ff = ffmpeg_bin()
    with tempfile.TemporaryDirectory() as tmp:
        for lid, spec in LESSON_MUSIC.items():
            mp3 = MUSIC / f"{lid}.mp3"
            if mp3.exists() and not force:
                continue
            mix = render_music(spec)
            wav = pathlib.Path(tmp) / f"{lid}.wav"
            write_wav(wav, mix)
            res = subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame",
                                  "-b:a", "160k", str(mp3)], capture_output=True, text=True)
            if res.returncode != 0:
                print(res.stderr)
                return 1
            print("music", mp3.name, f"{len(mix)/SR:.1f}s")
    # exact encoded durations, used by the Remotion timeline to lay the loop out
    probe = ff.replace("ffmpeg", "ffprobe")
    durations = {}
    for mp3 in sorted(MUSIC.glob("lesson-*.mp3")):
        res = subprocess.run([probe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(mp3)],
                             capture_output=True, text=True)
        durations[mp3.stem] = round(float(res.stdout.strip()), 3)
    (MUSIC / "durations.json").write_text(__import__("json").dumps(durations, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main("--force" in sys.argv))
