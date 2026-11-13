// Production renderer for the NEWL AFRICA training series.
//
//   node scripts/production/render.mjs                      # all six lessons
//   node scripts/production/render.mjs --lessons=lesson-02,lesson-04
//   node scripts/production/render.mjs --lessons=lesson-01 --scale=0.5   # quick preview
//
// For every lesson it:
//   1. renders the Remotion composition to H.264/AAC (1920x1080, 30 fps)
//   2. muxes the English subtitles into the MP4 as a soft (selectable) track
//   3. renders a poster frame
//   4. validates the result (streams present, duration matches the timeline, size sane)
// and writes videos/manifest.json. Any failure exits non-zero — no silent partial output.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const arg = (name, def) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : def;
};
const ALL = ["lesson-01", "lesson-02", "lesson-03", "lesson-04", "lesson-05", "lesson-06"];
const lessons = arg("lessons", ALL.join(",")).split(",").filter(Boolean);
const scale = Number(arg("scale", "1"));
const crf = Number(arg("crf", "20"));
const concurrency = arg("concurrency", null);
// GPU-backed ANGLE is ~2x faster on desktops; CI runners have no GPU, so the default (software) is used there.
const gl = process.env.RENDER_GL || (process.platform === "win32" || process.platform === "darwin" ? "angle" : null);

const unknown = lessons.filter((l) => !ALL.includes(l));
if (unknown.length) {
  console.error(`Unknown lesson id(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const bin = (name) => {
  const dir = fs.readdirSync("node_modules/@remotion").find((d) => d.startsWith("compositor-"));
  if (!dir) throw new Error("Remotion compositor binaries not found — run npm ci");
  const base = path.join("node_modules/@remotion", dir);
  const file = fs.readdirSync(base).find((f) => f === name || f === `${name}.exe`);
  if (!file) throw new Error(`${name} not found in ${base}`);
  return path.resolve(base, file);
};
const FFMPEG = bin("ffmpeg");
const FFPROBE = bin("ffprobe");
// The Remotion-bundled ffmpeg/ffprobe need their shared libraries on the path (Linux).
const libEnv = { ...process.env, LD_LIBRARY_PATH: `${path.dirname(FFMPEG)}:${process.env.LD_LIBRARY_PATH ?? ""}` };

// Remotion's bundled ffmpeg is a minimal build without subtitle support, so muxing the soft
// subtitle track needs a full ffmpeg: FFMPEG_PATH, or `ffmpeg` on PATH (installed in CI).
const MUX_FFMPEG = (() => {
  for (const cand of [process.env.FFMPEG_PATH, "ffmpeg"].filter(Boolean)) {
    try {
      execFileSync(cand, ["-hide_banner", "-encoders"], { stdio: "pipe" }).toString().includes("mov_text") || (() => { throw 0; })();
      return cand;
    } catch { /* try next */ }
  }
  return null;
})();
const embedSubs = MUX_FFMPEG !== null;
if (!embedSubs) console.warn("⚠ No full ffmpeg found: MP4s will not contain an embedded subtitle track (SRT/VTT sidecar files are still produced). Set FFMPEG_PATH to embed.");

const probe = (file) =>
  JSON.parse(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height", "-of", "json", file], { env: libEnv }).toString());

const lessonsData = JSON.parse(fs.readFileSync("data/lessons.json", "utf8")).lessons;

console.log(`Bundling Remotion project…`);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });

const manifestPath = "videos/manifest.json";
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { videos: {} };
const failures = [];

for (const id of lessons) {
  const meta = lessonsData.find((l) => l.id === id);
  const outDir = path.join("videos", id);
  fs.mkdirSync(outDir, { recursive: true });
  const finalFile = meta.video;
  const rawFile = path.join(outDir, `.${id}.raw.mp4`);
  const started = Date.now();
  try {
    if (!meta.narrationComplete) throw new Error("narration audio is missing — run generate_narration.py first");
    const composition = await selectComposition({ serveUrl, id, inputProps: { lessonId: id } });
    console.log(`\n▶ ${id}: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps / 60).toFixed(1)} min) at scale ${scale}`);
    let last = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      audioCodec: "aac",
      audioBitrate: "192k",
      crf,
      pixelFormat: "yuv420p",
      scale,
      outputLocation: rawFile,
      inputProps: { lessonId: id },
      concurrency: concurrency ? Number(concurrency) : undefined,
      chromiumOptions: gl ? { gl } : {},
      overwrite: true,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 100);
        if (pct >= last + 5) {
          last = pct;
          console.log(`  ${id} ${pct}%`);
        }
      },
    });

    // soft subtitles (selectable in players; the learning centre uses the WebVTT sidecar)
    if (embedSubs) {
      execFileSync(
        MUX_FFMPEG,
        ["-y", "-loglevel", "error", "-i", rawFile, "-i", meta.subtitles.srt, "-map", "0:v", "-map", "0:a", "-map", "1:s", "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text",
          "-metadata:s:s:0", "language=eng", "-metadata:s:s:0", "title=English", "-movflags", "+faststart", finalFile],
        { stdio: "inherit" },
      );
      fs.rmSync(rawFile, { force: true });
    } else {
      fs.renameSync(rawFile, finalFile);
    }

    await renderStill({ composition, serveUrl, output: meta.poster, frame: 300, imageFormat: "jpeg", jpegQuality: 86, scale: 0.75, inputProps: { lessonId: id } });

    // validation
    const info = probe(finalFile);
    const duration = Number(info.format.duration);
    const expected = composition.durationInFrames / composition.fps;
    const kinds = info.streams.map((s) => s.codec_type);
    const problems = [];
    if (!kinds.includes("video")) problems.push("no video stream");
    if (!kinds.includes("audio")) problems.push("no audio stream");
    if (embedSubs && !kinds.includes("subtitle")) problems.push("no subtitle stream");
    if (Math.abs(duration - expected) > 0.6) problems.push(`duration ${duration.toFixed(2)}s ≠ expected ${expected.toFixed(2)}s`);
    if (Number(info.format.size) < 2_000_000) problems.push(`file suspiciously small (${info.format.size} bytes)`);
    if (problems.length) throw new Error(`validation failed: ${problems.join("; ")}`);

    const sha256 = crypto.createHash("sha256").update(fs.readFileSync(finalFile)).digest("hex");
    const video = info.streams.find((s) => s.codec_type === "video");
    manifest.videos[id] = {
      file: finalFile,
      poster: meta.poster,
      duration: Math.round(duration * 10) / 10,
      bytes: Number(info.format.size),
      resolution: `${video.width}x${video.height}`,
      sha256,
      renderedAt: new Date().toISOString(),
      renderSeconds: Math.round((Date.now() - started) / 1000),
      embeddedSubtitles: embedSubs,
    };
    console.log(`✔ ${id}: ${finalFile} · ${(info.format.size / 1e6).toFixed(1)} MB · ${duration.toFixed(1)} s · ${video.width}x${video.height} · ${manifest.videos[id].renderSeconds}s`);
  } catch (err) {
    console.error(`✖ ${id}: ${err.message}`);
    if (fs.existsSync(rawFile)) console.error(`  raw render kept at ${rawFile} for inspection / retry`);
    failures.push(id);
  }
}

manifest.updated = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
if (failures.length) {
  console.error(`\nRender failed for: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`\nAll requested lessons rendered and validated.`);
