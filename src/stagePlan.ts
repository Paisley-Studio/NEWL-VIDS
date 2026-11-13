import type { Box, ReplicaState, TimedScene, TypeAction } from "./types";

/** Image shown during each beat of a screen scene (beats inherit the previous image). */
export const imagesOf = (scene: TimedScene): string[] => {
  let cur = scene.image ?? "";
  return scene.beats.map((b) => (cur = b.image ?? cur));
};

/** Replica state during each beat (scene state merged with every beat's state so far). */
export const statesOf = (scene: TimedScene): ReplicaState[] => {
  let cur: ReplicaState = { ...(scene.state ?? {}) };
  return scene.beats.map((b) => (cur = { ...cur, ...(b.state ?? {}) }));
};

/** Key of the visual layer a beat belongs to; overlays typed on one layer vanish when it changes. */
export const layerKeysOf = (scene: TimedScene): string[] =>
  scene.kind === "replica" ? statesOf(scene).map((s) => `${s.page}:${s.tab}:${s.modal ?? "none"}`) : imagesOf(scene);

export type PlannedType = TypeAction & { beat: number; start: number; dur: number };
export const CHARS_PER_FRAME = 0.62;

export const typingOf = (scene: TimedScene): PlannedType[] => {
  const out: PlannedType[] = [];
  scene.beats.forEach((b, i) => {
    let t = b.vStart + 18;
    (b.type ?? []).forEach((a) => {
      const dur = Math.max(12, Math.min(78, Math.round(a.text.length / CHARS_PER_FRAME)));
      out.push({ ...a, beat: i, start: t, dur });
      t += dur + 10;
    });
  });
  return out;
};

export type PlannedCursor = { beat: number; frame: number; to: [number, number] | string; click: boolean };
export const CURSOR_MOVE = 20;
export const cursorOf = (scene: TimedScene): PlannedCursor[] =>
  scene.beats.flatMap((b, i) => (b.cursor ? [{ beat: i, frame: b.vStart + 6, to: b.cursor.to, click: Boolean(b.cursor.click) }] : []));

export type PlannedCheck = { beat: number; frame: number; box: Box };
export const checksOf = (scene: TimedScene): PlannedCheck[] =>
  scene.beats.flatMap((b, i) => (b.check ?? []).map((box) => ({ beat: i, frame: b.vStart + 6 + CURSOR_MOVE + 2, box })));
