// Bundles src/export.ts with esbuild and runs it in Node.
// Writes subtitles/, data/lessons.json and resources/scripts/ from the real timeline.
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "newl-export-")), "export.mjs");
await build({
  entryPoints: ["src/export.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
  logLevel: "warning",
  // only needs the timeline + data; React components are never imported
  external: ["remotion", "react", "@fortawesome/*"],
});
await import(pathToFileURL(out).href);
