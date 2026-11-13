import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, hexToRgba, WINDOW } from "../theme";
import type { Timeline, TimedScene } from "../types";
import { NewlMark, prog } from "./base";

export const LessonCtx = createContext<{ tl: Timeline; accent: string } | null>(null);
export const useLesson = () => {
  const v = useContext(LessonCtx);
  if (!v) throw new Error("LessonCtx missing");
  return v;
};

/** Light, application-coloured backdrop used by screen, replica and diagram scenes. */
export const LightFrame: React.FC<{ scene: TimedScene; children: React.ReactNode }> = ({ scene, children }) => {
  const frame = useCurrentFrame();
  const { tl, accent } = useLesson();
  const lesson = tl.lesson;
  const drift = Math.sin((scene.start + frame) / 160) * 40;
  const label = prog(frame, 4, 18);
  const absolute = scene.start + frame;
  const done = Math.min(1, absolute / tl.total);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      {/* soft brand glow + dotted texture, echoing the login screen's radial gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${18 + drift / 40}% 12%, ${hexToRgba(accent, 0.1)}, transparent 46%), radial-gradient(circle at 88% 92%, rgba(30,107,58,0.07), transparent 40%)`,
        }}
      />
      {/* pre-rendered dot texture (scripts/production/build_frame_assets.py) — far cheaper than a masked CSS pattern */}
      <Img src={staticFile("frame/dots.png")} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }} />

      {/* header */}
      <div style={{ position: "absolute", left: WINDOW.x, right: WINDOW.x, top: 38, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <NewlMark size={42} />
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: C.text, letterSpacing: "-0.01em", lineHeight: 1.1 }}>NEWL AFRICA</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.textSoft, letterSpacing: "0.16em" }}>DIGITAL SYSTEM TRAINING</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#fff",
              background: accent,
              padding: "8px 16px",
              borderRadius: 999,
            }}
          >
            LESSON {String(lesson.number).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.textSoft }}>{lesson.shortTitle}</div>
        </div>
      </div>
      {/* chapter label in the app's "# SECTION" style */}
      <div
        style={{
          position: "absolute",
          left: WINDOW.x + 2,
          top: 104,
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: accent,
          opacity: label,
          transform: `translateX(${(1 - label) * -24}px)`,
        }}
      >
        # {scene.chapter}
      </div>
      {children}
      {/* lesson progress hairline */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 4, width: "100%", background: hexToRgba(accent, 0.12) }}>
        <div style={{ height: "100%", width: `${done * 100}%`, background: accent, opacity: 0.85 }} />
      </div>
    </AbsoluteFill>
  );
};

export const SceneTitle: React.FC<{ title: string; subtitle?: string; top?: number }> = ({ title, subtitle, top = 150 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 6, 22);
  const p2 = prog(frame, 14, 22);
  return (
    <div style={{ position: "absolute", left: WINDOW.x, top, right: WINDOW.x }}>
      <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.025em", color: C.text, lineHeight: 1.08, opacity: p, transform: `translateY(${(1 - p) * 22}px)` }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 26, fontWeight: 500, color: C.textSoft, marginTop: 12, opacity: p2, transform: `translateY(${(1 - p2) * 16}px)` }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
