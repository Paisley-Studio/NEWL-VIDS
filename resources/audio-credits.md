# Credits and licences

**Production and creative technology: KEYPOLE TECHNOLOGIES.**
The KEYPOLE TECHNOLOGIES logo used in every closing sequence and in the learning-centre footer is the supplied original artwork (`public/branding/keypole-technologies-logo.png`), used unaltered.

## Narration

- **Voice:** `en-US-ChristopherNeural`, a mature American male neural voice, rate −4%.
- **Engine:** Microsoft Edge neural text-to-speech, accessed with the open-source [`edge-tts`](https://github.com/rany2/edge-tts) client (GPL-3.0 tool; the tool's licence does not extend to the generated audio).
- **Licensing note:** the free Edge read-aloud service has no published commercial licence. For a formally licensed master, generate the same voice through **Azure AI Speech** under an Azure subscription (identical voice name), or set `NARRATION_VOICE` to a voice from another licensed provider. The pipeline is engine-agnostic: only `scripts/production/generate_narration.py` changes; timings, subtitles and video sync are regenerated automatically.
- Pronunciation rules (for example “NEWL” → “New L”, “KES 500,000” → “500,000 Kenyan shillings”) live in `scripts/production/pronunciation.json`.

## Music and sound effects

All background music (one original loop per lesson) and all sound effects (interface clicks, typing, confirmation tones, notification chime, SMS delivery, transitions, opening riser and logo impact) were **synthesised from scratch** by `scripts/production/generate_audio_assets.py` using additive synthesis in NumPy. No samples, loops or third-party recordings are used. They are original works created for this production and carry no third-party licence obligations.

## Typography and icons

- **Inter** typeface by Rasmus Andersson, SIL Open Font License 1.1 (`public/fonts/Inter-OFL-LICENSE.txt`); the same font the NEWL AFRICA application uses.
- **Font Awesome Free** icons (the icon set the application uses), icons under CC BY 4.0, code under MIT — © Fonticons, Inc. https://fontawesome.com/license/free

## Software

Rendering: Remotion 4 (React-based video; check the [Remotion licence](https://www.remotion.dev/license) — organisations above the free-tier threshold require a company licence), FFmpeg (bundled with Remotion), Chromium headless shell.
