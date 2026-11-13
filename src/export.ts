/**
 * Node-side exporter (bundled with esbuild by scripts/production/export.mjs).
 * Uses the exact same timeline as the Remotion compositions to write:
 *   subtitles/lesson-XX.en.srt / .vtt   word-timed, 2-line cues
 *   data/lessons.json                    learning-centre data (durations, chapters, URLs)
 *   resources/scripts/lesson-XX.md       full narration script + scene plan with timecodes
 */
import fs from "node:fs";
import path from "node:path";
import pron from "../scripts/production/pronunciation.json";
import screens from "../scripts/production/screenshots.json";
import { LESSONS, timelineFor } from "./lessons";
import { FPS } from "./theme";
import { chaptersOf } from "./timeline";
import type { Timeline, TimedBeat, TimedScene } from "./types";

const ROOT = process.cwd();
const rules = (pron as unknown as { rules: [string, string][] }).rules.map(([p, r]) => [new RegExp(p, "g"), r] as const);
const spoken = (t: string) => rules.reduce((s, [p, r]) => s.replace(p, r), t);
const alnum = (t: string) => t.replace(/[^\p{L}\p{N}]/gu, "").length;

type Cue = { start: number; end: number; text: string };

/* ---------------------------------------------------------------- subtitles */
const chunk = (text: string, max = 84): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur: string[] = [];
  const len = (a: string[]) => a.join(" ").length;
  words.forEach((w, i) => {
    if (cur.length && len([...cur, w]) > max) {
      out.push(cur.join(" "));
      cur = [];
    }
    cur.push(w);
    const strong = /[.!?]$/.test(w);
    const soft = /[,;:—]$/.test(w) || words[i + 1] === "—";
    if ((strong && len(cur) >= 18) || (soft && len(cur) >= 46)) {
      out.push(cur.join(" "));
      cur = [];
    }
  });
  if (cur.length) out.push(cur.join(" "));
  // merge a tiny trailing fragment into the previous cue
  if (out.length > 1 && out[out.length - 1].length < 14 && len([out[out.length - 2], out[out.length - 1]]) <= max + 8) {
    const last = out.pop() as string;
    out[out.length - 1] += " " + last;
  }
  return out;
};

const twoLines = (t: string, max = 44): string => {
  if (t.length <= max) return t;
  const words = t.split(" ");
  let best = t;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.abs(a.length - b.length) + (Math.max(a.length, b.length) > max ? 100 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = `${a}\n${b}`;
    }
  }
  return best;
};

const cuesForBeat = (scene: TimedScene, b: TimedBeat): Cue[] => {
  const base = (scene.start + b.start) / FPS;
  const dur = b.dur / FPS;
  const parts = chunk(b.text);
  const words = b.words;
  const totalChars = parts.reduce((s, p) => s + alnum(spoken(p)), 0) || 1;
  const cues: Cue[] = [];
  let wi = 0;
  let acc = 0;
  parts.forEach((p) => {
    const need = alnum(spoken(p));
    if (words.length) {
      const first = words[Math.min(wi, words.length - 1)];
      let got = 0;
      let last = first;
      while (wi < words.length && got < need) {
        got += alnum(words[wi].w);
        last = words[wi];
        wi++;
      }
      cues.push({ start: base + first.t, end: base + last.t + last.d, text: p });
    } else {
      const s = (acc / totalChars) * dur;
      acc += need;
      cues.push({ start: base + s, end: base + (acc / totalChars) * dur, text: p });
    }
  });
  return cues;
};

const buildCues = (tl: Timeline): Cue[] => {
  const cues = tl.scenes.flatMap((s) => s.beats.flatMap((b) => cuesForBeat(s, b)));
  for (let i = 0; i < cues.length; i++) {
    const next = cues[i + 1];
    const c = cues[i];
    c.start = Math.max(0, c.start - 0.05);
    const room = next ? next.start - 0.06 : c.end + 1.2;
    c.end = Math.min(room, Math.max(c.end + 0.35, c.start + 1.1));
  }
  return cues;
};

const ts = (sec: number, sep: string) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(r, 3)}`;
};

const toSrt = (cues: Cue[]) => cues.map((c, i) => `${i + 1}\n${ts(c.start, ",")} --> ${ts(c.end, ",")}\n${twoLines(c.text)}\n`).join("\n");
const toVtt = (cues: Cue[]) =>
  "WEBVTT\nKind: captions\nLanguage: en\n\n" + cues.map((c, i) => `${i + 1}\n${ts(c.start, ".")} --> ${ts(c.end, ".")} line:88% position:50% align:center\n${twoLines(c.text)}\n`).join("\n");

/* ---------------------------------------------------------------- scripts / scene plans */
const screenTitle: Record<string, string> = Object.fromEntries((screens as { screens: { id: string; title: string }[] }).screens.map((s) => [s.id, s.title]));
const mmss = (f: number) => {
  const s = Math.round(f / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const visualOf = (scene: TimedScene): string => {
  switch (scene.kind) {
    case "opening":
      return "Cinematic opening — NEWL AFRICA identity, lesson number, title and topic chips over animated geometric backdrop.";
    case "closing":
      return "NEWL AFRICA lesson summary — key takeaways revealed one by one, followed by the next-lesson card.";
    case "credits":
      return "Production credit — the KEYPOLE TECHNOLOGIES logo with light sweep and the line “Technology. Creativity. Excellence.” on black.";
    case "diagram":
      return `Motion graphic (${scene.diagram}) — “${scene.data?.title ?? ""}”.`;
    case "replica":
      return `Application view rendered from source: ${JSON.stringify(scene.state)}.`;
    default:
      return `Application screenshot: ${screenTitle[scene.image ?? ""] ?? scene.image} (${scene.image}.png).`;
  }
};

const directionOf = (b: TimedBeat): string => {
  const parts: string[] = [];
  if (b.image) parts.push(`switch to ${b.image}`);
  if (b.state) parts.push(`view state ${JSON.stringify(b.state)}`);
  if (b.cam) parts.push(b.cam === "full" ? "full view" : `camera → ${Array.isArray(b.cam) ? `[${b.cam.join(", ")}]` : b.cam}`);
  if (b.hl?.length) parts.push(`highlight ${b.hl.map((h) => (h.label ? `“${h.label}”` : h.target ?? "region")).join(", ")}`);
  if (b.cursor) parts.push(`cursor ${b.cursor.click ? "clicks" : "moves to"} ${Array.isArray(b.cursor.to) ? `(${b.cursor.to.join(", ")})` : b.cursor.to}`);
  if (b.type?.length) parts.push(`types ${b.type.map((t) => `“${t.text}”`).join(", ")}`);
  if (b.check?.length) parts.push("ticks checkbox");
  if (b.callout) parts.push(`callout “${b.callout.title}”`);
  if (b.show !== undefined) parts.push(`reveal ${JSON.stringify(b.show)}`);
  if (b.focus !== undefined) parts.push(`focus item ${b.focus + 1}`);
  if (b.footer) parts.push("footer line");
  if (b.sfx?.length) parts.push(`sfx: ${b.sfx.join(", ")}`);
  return parts.join("; ") || "—";
};

const scriptMd = (tl: Timeline): string => {
  const l = tl.lesson;
  const words = l.scenes.reduce((s, sc) => s + sc.beats.reduce((x, b) => x + b.text.split(/\s+/).length, 0), 0);
  const lines: string[] = [];
  lines.push(`# Lesson ${String(l.number).padStart(2, "0")} — ${l.title}`, "");
  lines.push(`**Theme:** ${l.theme}  `, `**Audience:** ${l.audience.join(", ")}  `, `**Running time:** ${mmss(tl.total)} · **Narration:** ${words} words · **Voice:** mature American male (en-US-ChristopherNeural)`, "");
  lines.push("## Learning objectives", "", ...l.objectives.map((o) => `- ${o}`), "");
  lines.push("## Full narration script", "");
  let chapter = "";
  for (const s of tl.scenes) {
    if (s.chapter !== chapter) {
      chapter = s.chapter;
      lines.push(`### ${chapter}`, "");
    }
    lines.push(s.beats.map((b) => b.text).join(" "), "");
  }
  lines.push("## Scene plan", "", "Timecodes are taken from the rendered timeline. Visual actions start ~0.25 s before the words they illustrate.", "");
  for (const s of tl.scenes) {
    lines.push(`### Scene ${s.index + 1} · ${s.chapter} · ${mmss(s.start)}–${mmss(s.start + s.duration)}`, "", `**Visual:** ${visualOf(s)}`, "");
    lines.push("| Time | Narration | Visual direction |", "|---|---|---|");
    for (const b of s.beats) lines.push(`| ${mmss(s.start + b.start)} | ${b.text.replace(/\|/g, "\\|")} | ${directionOf(b).replace(/\|/g, "\\|")} |`);
    lines.push("");
  }
  return lines.join("\n");
};

/* ---------------------------------------------------------------- main */
const write = (rel: string, content: string) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
};

const lessonsOut = LESSONS.map((l) => {
  const tl = timelineFor(l.id);
  const cues = buildCues(tl);
  write(`subtitles/${l.id}.en.srt`, toSrt(cues));
  write(`subtitles/${l.id}.en.vtt`, toVtt(cues));
  write(`resources/scripts/${l.id}.md`, scriptMd(tl));
  const n = String(l.number).padStart(2, "0");
  console.log(`${l.id}: ${mmss(tl.total)} · ${tl.scenes.length} scenes · ${cues.length} cues · audio ${tl.hasAudio ? "complete" : "MISSING"}`);
  return {
    id: l.id,
    number: l.number,
    title: l.title,
    shortTitle: l.shortTitle,
    theme: l.theme,
    description: l.description,
    audience: l.audience,
    objectives: l.objectives,
    accent: l.accent,
    duration: Math.round((tl.total / FPS) * 10) / 10,
    narrationComplete: tl.hasAudio,
    chapters: chaptersOf(tl).map((c) => ({ title: c.title, start: Math.round(c.start * 10) / 10 })),
    video: `videos/${l.id}/newl-africa-lesson-${n}.mp4`,
    poster: `videos/${l.id}/poster.jpg`,
    subtitles: { vtt: `subtitles/${l.id}.en.vtt`, srt: `subtitles/${l.id}.en.srt` },
    script: `resources/scripts/${l.id}.md`,
  };
});

write("data/lessons.json", JSON.stringify({ generated: new Date().toISOString(), lessons: lessonsOut }, null, 2));
console.log("wrote data/lessons.json, subtitles/, resources/scripts/");
