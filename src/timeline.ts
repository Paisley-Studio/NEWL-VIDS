import { FPS } from "./theme";
import type { Lesson, LessonTiming, Timeline, TimedBeat, TimedScene } from "./types";

/** Seconds of visual lead-in before the first narrated beat, per scene kind. */
const LEAD: Record<string, number> = { opening: 4.6, screen: 0.55, replica: 0.55, diagram: 0.7, closing: 0.9, credits: 1.4 };
/** Seconds held after the last beat, per scene kind. */
const TAIL: Record<string, number> = { opening: 1.1, screen: 0.7, replica: 0.7, diagram: 0.8, closing: 1.4, credits: 5.6 };
export const BEAT_GAP = 0.42;
export const TRANSITION = 14; // frames of cross-fade overlap between scenes
export const VISUAL_LEAD = 8; // frames visuals start before the narration they illustrate

const f = (sec: number) => Math.round(sec * FPS);

/** Estimate used only when narration audio has not been generated yet. */
const estimate = (text: string) => Math.max(1.4, text.split(/\s+/).length / 2.45);

export const buildTimeline = (lesson: Lesson, timing: LessonTiming | null): Timeline => {
  let cursor = 0;
  let hasAudio = Boolean(timing);
  const scenes: TimedScene[] = lesson.scenes.map((scene, index) => {
    let t = f(LEAD[scene.kind] ?? 0.6);
    const beats: TimedBeat[] = scene.beats.map((beat, i) => {
      const key = `${scene.id}-${i}`;
      const bt = timing?.beats[key];
      if (!bt) hasAudio = false;
      const dur = f(bt ? bt.duration : estimate(beat.text));
      const start = t;
      t += dur + f(BEAT_GAP + (beat.pause ?? 0));
      return {
        ...beat,
        key,
        start,
        dur,
        end: start + dur,
        vStart: Math.max(0, start - VISUAL_LEAD),
        audio: bt?.file,
        words: bt?.words ?? [],
      };
    });
    const duration = t - f(BEAT_GAP) + f(TAIL[scene.kind] ?? 0.7);
    const start = index === 0 ? 0 : cursor - TRANSITION;
    cursor = start + duration;
    return { ...scene, index, start, duration, beats };
  });
  return { lesson, scenes, total: cursor, hasAudio };
};

/** Index of the beat whose visuals are active at a scene-relative frame. */
export const beatAt = (scene: TimedScene, frame: number) => {
  let idx = 0;
  scene.beats.forEach((b, i) => {
    if (frame >= b.vStart) idx = i;
  });
  return idx;
};

/** Chapters for the learning centre (consecutive scenes sharing a chapter title merge). */
export const chaptersOf = (tl: Timeline) => {
  const out: { title: string; start: number }[] = [];
  for (const s of tl.scenes) {
    if (s.kind === "credits") continue;
    if (!out.length || out[out.length - 1].title !== s.chapter) out.push({ title: s.chapter, start: s.start / FPS });
  }
  return out;
};
