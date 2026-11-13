import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ensureFonts, prog } from "./components/base";
import { LessonCtx, LightFrame } from "./components/Frame";
import { StageScene } from "./components/Stage";
import { timelineFor } from "./lessons";
import { ClosingScene, CreditsScene } from "./scenes/Closing";
import { DiagramScene } from "./scenes/Diagrams";
import { OpeningScene } from "./scenes/Opening";
import { checksOf, cursorOf, CURSOR_MOVE, typingOf } from "./stagePlan";
import { TRANSITION } from "./timeline";
import type { Timeline, TimedScene } from "./types";
import musicDurations from "../public/audio/music/durations.json";
import { FPS } from "./theme";

export type LessonProps = { lessonId: string };

/** Master gain (+3.2 dB) applied to every layer; measured peak stays below -1.5 dBFS. */
const MASTER = 1.45;

type Sfx = { at: number; name: string; vol: number; len?: number };

/** Every sound effect cue, derived from the same plan that drives the visuals. */
const planSfx = (tl: Timeline): Sfx[] => {
  const out: Sfx[] = [];
  for (const s of tl.scenes) {
    const abs = (f: number) => s.start + f;
    if (s.kind === "opening") {
      out.push({ at: 0, name: "riser", vol: 0.55 }, { at: 98, name: "impact", vol: 0.55 }, { at: 102, name: "shimmer", vol: 0.35 });
      continue;
    }
    if (s.kind === "credits") {
      out.push({ at: abs(0), name: "whoosh", vol: 0.5 }, { at: abs(20), name: "impact", vol: 0.75 }, { at: abs(30), name: "shimmer", vol: 0.55 });
      continue;
    }
    out.push({ at: abs(0), name: s.kind === "closing" ? "whoosh" : "whoosh-soft", vol: 0.55 });
    if (s.kind === "screen" || s.kind === "replica") {
      const clicks = cursorOf(s);
      clicks.filter((c) => c.click).forEach((c) => out.push({ at: abs(c.frame + CURSOR_MOVE), name: "click", vol: 0.7 }));
      typingOf(s).forEach((t) => out.push({ at: abs(t.start), name: "typing", vol: 0.55, len: t.dur + 4 }));
      checksOf(s).forEach((c) => out.push({ at: abs(c.frame), name: "click", vol: 0.4 }));
    }
    s.beats.forEach((b, i) => {
      if (b.callout) out.push({ at: abs(b.vStart + 12), name: "pop", vol: 0.45 });
      const clickAt = b.cursor?.click ? b.vStart + 6 + CURSOR_MOVE + 6 : b.vStart + 10;
      (b.sfx ?? []).forEach((name, k) => out.push({ at: abs(clickAt + k * 16), name, vol: name === "data" ? 0.45 : 0.6 }));
      if (s.kind === "diagram" || s.kind === "closing") {
        const prev = i > 0 ? s.beats[i - 1].show : 0;
        if (b.show !== undefined && JSON.stringify(b.show) !== JSON.stringify(prev) && !(b.sfx ?? []).length) out.push({ at: abs(b.vStart + 6), name: "pop", vol: 0.28 });
      }
    });
  }
  return out;
};

const SceneSwitch: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  switch (scene.kind) {
    case "opening":
      return <OpeningScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    case "credits":
      return <CreditsScene scene={scene} />;
    case "diagram":
      return (
        <LightFrame scene={scene}>
          <DiagramScene scene={scene} />
        </LightFrame>
      );
    default:
      return (
        <LightFrame scene={scene}>
          <StageScene scene={scene} />
        </LightFrame>
      );
  }
};

const SceneLayer: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const fade = scene.index === 0 ? 1 : prog(frame, 0, TRANSITION);
  const zoom = scene.index === 0 ? 1 : 1.015 - 0.015 * fade;
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `scale(${zoom})` }}>
      <SceneSwitch scene={scene} />
    </AbsoluteFill>
  );
};

export const LessonVideo: React.FC<LessonProps> = ({ lessonId }) => {
  ensureFonts();
  const tl = useMemo(() => timelineFor(lessonId), [lessonId]);
  const sfx = useMemo(() => planSfx(tl), [tl]);
  const musicLen = Math.floor(((musicDurations as Record<string, number>)[tl.lesson.id] ?? 170) * FPS) - 1;

  // music ducking envelope: lower under narration, fuller in openings and credits
  const musicVol = useMemo(() => {
    const v = new Float32Array(tl.total + 1);
    for (const s of tl.scenes) {
      const free = s.kind === "opening" || s.kind === "credits" ? 0.3 : 0.17;
      for (let f = s.start; f < s.start + s.duration && f <= tl.total; f++) v[f] = free;
    }
    for (const s of tl.scenes)
      for (const b of s.beats)
        for (let f = s.start + b.start - 6; f < s.start + b.end + 8 && f <= tl.total; f++) if (f >= 0) v[f] = s.kind === "credits" ? 0.14 : 0.075;
    // smooth (≈0.5 s) so the ducking breathes rather than pumps
    const out = new Float32Array(v.length);
    const r = 12;
    for (let i = 0; i < v.length; i++) {
      let acc = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const j = i + k;
        if (j >= 0 && j < v.length) {
          acc += v[j];
          n++;
        }
      }
      out[i] = acc / n;
    }
    for (let i = 0; i < out.length; i++) {
      const fadeIn = Math.min(1, i / 45);
      const fadeOut = Math.min(1, (tl.total - i) / 120);
      out[i] *= fadeIn * Math.max(0, fadeOut);
    }
    return out;
  }, [tl]);

  return (
    <LessonCtx.Provider value={{ tl, accent: tl.lesson.accent }}>
      <AbsoluteFill style={{ background: "#000" }}>
        {tl.scenes.map((s) => (
          <Sequence key={s.id} from={s.start} durationInFrames={s.duration} name={`${s.index + 1}. ${s.chapter} (${s.kind})`}>
            <SceneLayer scene={s} />
          </Sequence>
        ))}
        {/* narration */}
        {tl.scenes.flatMap((s) =>
          s.beats
            .filter((b) => b.audio)
            .map((b) => (
              <Sequence key={b.key} from={s.start + b.start} durationInFrames={b.dur + 15} name={`VO ${b.key}`} layout="none">
                <Audio src={staticFile(b.audio as string)} volume={MASTER} />
              </Sequence>
            )),
        )}
        {/* music: seamless loop laid out as explicit segments so the ducking envelope stays absolute */}
        {Array.from({ length: Math.ceil(tl.total / musicLen) }, (_, k) => (
          <Sequence key={`music${k}`} from={k * musicLen} durationInFrames={Math.min(musicLen, tl.total - k * musicLen)} layout="none" name={`Music ${k + 1}`}>
            <Audio
              src={staticFile(`audio/music/${tl.lesson.id}.mp3`)}
              volume={(f) => {
                const i = Math.min(musicVol.length - 1, Math.max(0, Math.round(f + k * musicLen)));
                const edge = Math.min(1, (f + 1) / 3, (musicLen - f) / 3);
                return (musicVol[i] || 0) * Math.max(0, edge) * MASTER;
              }}
            />
          </Sequence>
        ))}
        {/* sound design */}
        {sfx.map((e, i) => (
          <Sequence key={`sfx${i}`} from={Math.max(0, e.at)} durationInFrames={e.len ?? 120} layout="none" name={`SFX ${e.name}`}>
            <Audio src={staticFile(`audio/sfx/${e.name}.wav`)} volume={e.vol * MASTER} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </LessonCtx.Provider>
  );
};
