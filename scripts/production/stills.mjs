// Render QA stills / posters without re-bundling for every frame.
// Usage: node scripts/production/stills.mjs lesson-01 1400,2850,4600 [outDir] [--scale=0.5]
//        node scripts/production/stills.mjs --posters        (poster.jpg for every lesson)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 1;
const posters = args.includes("--posters");
const positional = args.filter((a) => !a.startsWith("--"));

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });

const jobs = [];
if (posters) {
  for (let n = 1; n <= 6; n++) {
    const id = `lesson-0${n}`;
    jobs.push({ id, frame: 300, out: `videos/${id}/poster.jpg`, format: "jpeg" });
  }
} else {
  const [id, frames, outDir = "out"] = positional;
  for (const f of frames.split(",")) jobs.push({ id, frame: Number(f), out: path.join(outDir, `${id}-${f}.png`), format: "png" });
}

for (const j of jobs) {
  const composition = await selectComposition({ serveUrl, id: j.id, inputProps: { lessonId: j.id } });
  fs.mkdirSync(path.dirname(j.out), { recursive: true });
  await renderStill({ composition, serveUrl, output: j.out, frame: j.frame, inputProps: { lessonId: j.id }, imageFormat: j.format, scale, ...(j.format === "jpeg" ? { jpegQuality: 88 } : {}) });
  console.log("still", j.out);
}
