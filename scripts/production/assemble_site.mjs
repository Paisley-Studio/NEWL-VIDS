// Assemble the deployable learning centre into a folder (default _site).
//
//   node scripts/production/assemble_site.mjs [--out=_site] [--videos=<dir>] [--release-url=<base>]
//
// --videos       folder holding rendered files, either in the repo layout
//                (videos/lesson-XX/newl-africa-lesson-XX.mp4 + poster.jpg) or flat
//                (newl-africa-lesson-XX.mp4 + newl-africa-lesson-XX-poster.jpg, as in the GitHub Release).
// --release-url  base URL of the GitHub Release assets. Videos larger than GitHub Pages
//                comfortably serves (> 95 MB each, or > 900 MB in total) are not copied;
//                the site is configured to stream them from the release instead.
import fs from "node:fs";
import path from "node:path";

const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || `=${d ?? ""}`).split("=").slice(1).join("=");
const OUT = arg("out", "_site");
const VIDEOS = arg("videos", "videos");
const RELEASE = arg("release-url", "");
const MAX_FILE = 95 * 1024 * 1024;
const MAX_TOTAL = 900 * 1024 * 1024;

fs.rmSync(OUT, { recursive: true, force: true });
const copy = (src, dst = src) => {
  if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
  fs.cpSync(src, path.join(OUT, dst), { recursive: true });
};
copy("index.html");
copy("assets");
copy("data");
copy("subtitles");
copy("resources");
copy("public/branding");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

const { lessons } = JSON.parse(fs.readFileSync("data/lessons.json", "utf8"));
const overrides = { videos: {}, posters: {} };
let total = 0;
const report = [];
for (const l of lessons) {
  const n = String(l.number).padStart(2, "0");
  const candidates = [path.join(VIDEOS, l.id, `newl-africa-lesson-${n}.mp4`), path.join(VIDEOS, `newl-africa-lesson-${n}.mp4`)];
  const posters = [path.join(VIDEOS, l.id, "poster.jpg"), path.join(VIDEOS, `newl-africa-lesson-${n}-poster.jpg`)];
  const video = candidates.find((p) => fs.existsSync(p));
  const poster = posters.find((p) => fs.existsSync(p));
  if (poster) copy(poster, l.poster);
  else if (RELEASE) overrides.posters[l.id] = `${RELEASE}/newl-africa-lesson-${n}-poster.jpg`;
  if (!video) {
    if (RELEASE) {
      overrides.videos[l.id] = `${RELEASE}/newl-africa-lesson-${n}.mp4`;
      report.push(`${l.id}: not available locally → streamed from release`);
    } else report.push(`${l.id}: no rendered video (the player will show "not yet published")`);
    continue;
  }
  const size = fs.statSync(video).size;
  if (size <= MAX_FILE && total + size <= MAX_TOTAL) {
    copy(video, l.video);
    total += size;
    report.push(`${l.id}: hosted on site (${(size / 1e6).toFixed(1)} MB)`);
  } else if (RELEASE) {
    overrides.videos[l.id] = `${RELEASE}/newl-africa-lesson-${n}.mp4`;
    report.push(`${l.id}: ${(size / 1e6).toFixed(1)} MB exceeds Pages budget → streamed from release`);
  } else {
    throw new Error(`${l.id} is ${(size / 1e6).toFixed(1)} MB — too large for GitHub Pages and no --release-url given`);
  }
}

// write deployment overrides into the site's config without touching the source file
if (Object.keys(overrides.videos).length || Object.keys(overrides.posters).length) {
  const cfg = path.join(OUT, "assets/js/config.js");
  fs.appendFileSync(
    cfg,
    `\n/* deployment overrides written by assemble_site.mjs */\nObject.assign(window.NEWL_TRAINING_CONFIG.videos, ${JSON.stringify(overrides.videos)});\nObject.assign(window.NEWL_TRAINING_CONFIG.posters, ${JSON.stringify(overrides.posters)});\n`,
  );
}
console.log(report.join("\n"));
console.log(`site assembled in ${OUT} (${(total / 1e6).toFixed(0)} MB of video)`);
