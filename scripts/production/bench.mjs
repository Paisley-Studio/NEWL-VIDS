// Render-speed benchmark: node scripts/production/bench.mjs lesson-05 1600-1840 4,8
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, range, concs = "4"] = process.argv.slice(2);
const [a, b] = range.split("-").map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id, inputProps: { lessonId: id } });
for (const c of concs.split(",")) {
  const t = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", frameRange: [a, b], outputLocation: `out/bench-${c}.mp4`, inputProps: { lessonId: id }, concurrency: Number(c), overwrite: true, muted: true, chromiumOptions: process.env.GL ? { gl: process.env.GL } : {} });
  const s = (Date.now() - t) / 1000;
  console.log(`concurrency ${c}: ${(b - a + 1)} frames in ${s.toFixed(1)}s = ${((b - a + 1) / s).toFixed(1)} fps`);
}
