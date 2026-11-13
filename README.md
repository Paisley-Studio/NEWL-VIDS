# NEWL AFRICA — Digital System Training

The official training programme for the NEWL AFRICA project management platform: six narrated, cinematic lessons, an automated video production pipeline, and a learning centre to watch them in.

**Production and creative technology: KEYPOLE TECHNOLOGIES.**

| Lesson | Title | Runtime |
|---|---|---|
| 01 | Introducing the NEWL AFRICA Management System | 8:14 |
| 02 | Project and Team Management | 9:39 |
| 03 | Site Operations, Casual Workers and Daily Reporting | 7:27 |
| 04 | Financial Management and Budget Intelligence | 8:28 |
| 05 | Notifications, Communication and Accountability | 6:51 |
| 06 | System Administration, Oversight and Best Practices | 6:46 |

Total ≈ 47 minutes · 1920×1080 · 30 fps · H.264/AAC · English subtitles (SRT + WebVTT, plus an embedded soft track when rendered with a full ffmpeg, as in CI).

---

## The three deliverables

### A. Training content
| What | Where |
|---|---|
| Lesson scripts — word-for-word narration **and** visual direction for every beat (camera framing, highlights, cursor, typing, callouts) | `scripts/narration/lesson-0N.json` (source of truth) |
| Readable narration scripts + scene plans with timecodes | `resources/scripts/lesson-0N.md` / `.html` (generated) |
| Subtitles | `subtitles/lesson-0N.en.srt`, `.vtt` (generated from word timings) |
| Screen inventory and workflow order | `resources/screenshot-sequence.md`, `scripts/production/screenshots.json` |
| What was verified in the application source, and notes for the technical team | `resources/application-review.md` |
| Quick reference guide | `resources/quick-reference.md` |

### B. Video production system
| What | Where |
|---|---|
| Remotion compositions `lesson-01` … `lesson-06` | `src/` |
| Narration (mature American male neural voice) + word timings | `scripts/production/generate_narration.py` → `public/audio/narration/`, `src/generated/` |
| Original music and sound effects (synthesised, no third-party audio) | `scripts/production/generate_audio_assets.py` → `public/audio/` |
| Redacted, sequenced screenshots | `scripts/production/sanitize_screenshots.py` → `public/screenshots/` |
| Renderer (render → mux subtitles → poster → validate) | `scripts/production/render.mjs` |
| GitHub Actions | `.github/workflows/render-training.yml`, `deploy-learning-centre.yml` |

### C. Learning centre
`index.html` + `assets/` — responsive, no accounts. Featured player with chapter markers, chapter list, subtitles toggle, speed control, fullscreen, keyboard shortcuts, previous/next lesson, resume (“continue watching”), per-lesson and overall completion tracking (stored in the viewer's browser), lesson grid, learning resources and the KEYPOLE TECHNOLOGIES credit. Video locations are configured in `assets/js/config.js`.

---

## How a lesson is built

```
scripts/narration/lesson-0N.json ──► generate_narration.py ──► narration mp3 + word timings
          │                                                              │
          ├──────────────► Remotion timeline (src/timeline.ts) ◄─────────┘
          │                 every scene/beat lasts exactly as long as its narration;
          │                 visuals start ~0.25 s before the words they illustrate
          │
          ├──► src/LessonVideo.tsx: opening · screen scenes (real screenshots, camera, spotlight,
          │    cursor, typing) · replicas · motion-graphic diagrams · summary · KEYPOLE credit
          │    + narration + ducked music + sound design
          │
          └──► export.ts: SRT/VTT subtitles · data/lessons.json (durations, chapters) · scripts
```

Because the timeline is derived from the measured narration, editing a sentence in a lesson script and re-running `npm run narration && npm run export` keeps picture, sound and subtitles in sync automatically.

**The application is the source of truth.** Every screen comes from the supplied screenshots. Views with no screenshot (project detail page, Submit Daily Log, Add Expenditure, Mark Complete, team-leader Daily Logs) are rebuilt from the application's own markup and CSS (`src/replica/`) and labelled on screen as such. See `resources/application-review.md`.

---

## Working locally

Requirements: Node 20+ (22 recommended), Python 3.11+, internet access for narration synthesis.

```bash
npm ci
pip install -r scripts/production/requirements.txt

npm run dev            # Remotion Studio — preview and scrub any lesson
npm run serve          # learning centre at http://localhost:8080
```

| Command | Purpose |
|---|---|
| `npm run screenshots` | Rebuild redacted screenshots from `Images/` (local only) |
| `npm run narration` | Synthesise narration (cached; only changed beats are regenerated). `NARRATION_VOICE`, `NARRATION_RATE` env vars |
| `npm run audio` | Regenerate music + sound effects (`-- --force` to overwrite) |
| `npm run export` | Subtitles, `data/lessons.json`, script/scene-plan pages |
| `npm run verify` | Asset paths, narration completeness, subtitle integrity, site references, credential scan |
| `npm run render` | Render all lessons to `videos/` (add `-- --lessons=lesson-03`) |
| `npm run render:preview` | Half-resolution quick render |
| `npm run posters` | Poster frames only |

Local rendering uses the GPU (`RENDER_GL=angle`) on Windows/macOS: ~13 fps, roughly 20 minutes per lesson on an 8-core machine. You do not need to render locally — use GitHub Actions.

**Embedded subtitles.** Remotion's bundled ffmpeg cannot write subtitle tracks, so `render.mjs` embeds the selectable English track only when a full ffmpeg is available (`FFMPEG_PATH`, or `ffmpeg` on `PATH` — the CI workflow installs it). Without one, the MP4 is produced without the embedded track, a warning is printed, and the SRT/WebVTT sidecar files remain the subtitle deliverable (the learning centre always uses the WebVTT file). `videos/manifest.json` records `embeddedSubtitles` for every render.

**Audio mix.** Narration ≈ −21.5 dB RMS with peaks ≤ −1.5 dBFS; music is ducked ~17 dB beneath the voice and rises only in openings, pauses and credits.

---

## Rendering with GitHub Actions

1. Push this repository to GitHub (the redacted screenshots, narration, music and subtitles are committed; rendered videos and original screenshots are not).
2. **Settings → Pages → Source: GitHub Actions** (one-time).
3. **Actions → Render training videos → Run workflow**:
   - `lessons`: `all` or a single lesson
   - `regenerate_narration`: only if scripts changed and narration wasn't regenerated locally
   - `preview`: half resolution for a quick check
   - `publish`: upload to the `training-videos` release and redeploy the learning centre

   CLI equivalent: `gh workflow run render-training.yml -f lessons=all -f publish=true`

What happens: a **prepare** job exports subtitles/data and runs `verify` and the type-check; six **render** jobs run in parallel (one per lesson, ~1–2.5 h each on standard runners, software rendering); each validates its MP4 (video, audio and subtitle streams present, duration equal to the timeline, plausible size) and **fails the run** otherwise. Outputs are uploaded as artifacts `video-lesson-0N` (kept 14 days).

The learning centre also redeploys automatically on any push that changes `index.html`, `assets/`, `data/`, `subtitles/` or `resources/` (**Deploy learning centre** workflow).

## Video storage and publishing

GitHub Actions artifacts are **temporary** (14 days here) — they are a hand-off, not hosting.

| Layer | Role | Persistence |
|---|---|---|
| Actions artifacts | Download a fresh render for review | 14 days |
| GitHub Release `training-videos` | Permanent storage of the published MP4s, posters and subtitles | Until deleted |
| GitHub Pages | Hosts the learning centre; videos are copied in from the release | Redeployed on publish/push |

`assemble_site.mjs` copies each video into the Pages site if it is ≤ 95 MB (and the total stays under 900 MB, within Pages' 1 GB limit). Larger videos are streamed directly from the release URL instead, written into the deployed `config.js` automatically. Release downloads are served as generic binary files; they play in Chromium-based browsers and Firefox but may not stream in Safari. For a large audience or a private deployment, host the MP4s on a CDN or object store (Cloudflare R2, S3, Bunny Stream…) and set `videoBaseUrl` or per-lesson `videos` URLs in `assets/js/config.js` — no interface changes needed.

If no release exists yet, the learning centre shows each lesson as **“Video not yet published”** with links to its script and subtitles — it never pretends a video exists.

> Note: GitHub Pages sites are public unless your plan supports private Pages. If the training should be internal-only, deploy the assembled `_site` folder to an access-controlled host instead.

---

## Security and privacy

- Original screenshots contained team-leader passwords, phone numbers, e-mail addresses, a Firebase Auth UID and the SMS Worker URL. They live only in `Images/` (git-ignored); every published copy is redacted.
- `npm run verify` scans all published files for Worker URLs, generated passwords, API keys, staff e-mail addresses and phone numbers, and fails if any are found.
- No Firebase configuration or secrets are used by this project.

## Repository layout

```
index.html, assets/          learning centre
data/lessons.json            generated lesson catalogue (durations, chapters, URLs)
subtitles/                   generated SRT + WebVTT
resources/                   guides, review, credits; resources/scripts = scripts + scene plans
public/                      Remotion static files: screenshots, branding, fonts, audio, frame
scripts/narration/           the six lesson scripts (narration + visual direction)
scripts/production/          pipeline scripts
src/                         Remotion source (scenes, stage/camera engine, diagrams, replicas)
Images/, Images.zip           supplied originals (local only, git-ignored — contain credentials)
videos/                      render output (git-ignored) + manifest.json
.github/workflows/           render + deploy
```

## Credits

Narration voice, music, sound design, fonts and icons: see `resources/audio-credits.md`. Remotion may require a company licence for some organisations — see remotion.dev/license.

Training Experience Designed & Developed by **KEYPOLE TECHNOLOGIES** — *Technology. Creativity. Excellence.*
