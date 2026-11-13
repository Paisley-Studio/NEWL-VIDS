import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, easeInOut, Icon, NewlMark, prog } from "../components/base";
import { useLesson } from "../components/Frame";
import { C, FONT, hexToRgba } from "../theme";
import type { TimedScene } from "../types";

/** Animated perspective grid + drifting geometry behind the cinematic openings. */
export const DarkBackdrop: React.FC<{ accent: string; frame: number; intensity?: number }> = ({ accent, frame, intensity = 1 }) => {
  const lines = [];
  for (let i = -12; i <= 12; i++) lines.push(<line key={`v${i}`} x1={960 + i * 46} y1={0} x2={960 + i * 300} y2={520} stroke={accent} strokeOpacity={0.22} strokeWidth={1} />);
  const shift = (frame * 1.2) % 60;
  for (let j = 0; j < 12; j++) {
    const y = Math.pow((j * 60 + shift) / 720, 2.2) * 520;
    lines.push(<line key={`h${j}`} x1={0} y1={y} x2={1920} y2={y} stroke={accent} strokeOpacity={0.05 + (y / 520) * 0.2} strokeWidth={1} />);
  }
  const shapes = [
    { x: 260, y: 220, r: 70, sp: 0.4, sides: 6 },
    { x: 1660, y: 260, r: 90, sp: -0.3, sides: 4 },
    { x: 1500, y: 820, r: 54, sp: 0.5, sides: 3 },
    { x: 380, y: 860, r: 110, sp: -0.2, sides: 6 },
    { x: 1780, y: 560, r: 40, sp: 0.6, sides: 4 },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${hexToRgba(accent, 0.34 * intensity)}, ${C.ink} 62%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(30,107,58,0.35), transparent 55%)` }} />
      <svg width={1920} height={520} style={{ position: "absolute", left: 0, bottom: 0, opacity: 0.9 * intensity }}>
        <g transform="translate(0,0)">{lines}</g>
        <defs>
          <linearGradient id="fadeGrid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.ink} stopOpacity="1" />
            <stop offset="0.6" stopColor={C.ink} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={1920} height={520} fill="url(#fadeGrid)" />
      </svg>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {shapes.map((s, i) => {
          const pts = Array.from({ length: s.sides }, (_, k) => {
            const a = (k / s.sides) * Math.PI * 2 + frame * 0.01 * s.sp;
            return `${s.x + Math.cos(a) * s.r},${s.y + Math.sin(a) * s.r + Math.sin(frame / 40 + i) * 12}`;
          }).join(" ");
          return <polygon key={i} points={pts} fill="none" stroke={i % 2 ? accent : "#7fd39b"} strokeOpacity={0.18 * intensity} strokeWidth={1.5} />;
        })}
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 197.3) % 1920;
          const y = (i * 311.7 + frame * (0.3 + (i % 5) * 0.12)) % 1080;
          return <circle key={`p${i}`} cx={x} cy={1080 - y} r={1 + (i % 3) * 0.7} fill="#bff0cf" opacity={(0.12 + (i % 4) * 0.06) * intensity} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const OpeningScene: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { tl, accent } = useLesson();
  const lesson = tl.lesson;

  const markIn = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 120 } });
  const ring = prog(frame, 16, 40);
  const word = prog(frame, 26, 34);
  const sub = prog(frame, 44, 26);
  const lift = prog(frame, 84, 30, easeInOut);
  const lessonIn = prog(frame, 100, 26);
  const numberWipe = prog(frame, 100, 22, ease);
  const titleIn = prog(frame, 112, 26);
  const themeIn = prog(frame, 126, 24);
  const chipsStart = scene.beats[1]?.vStart ?? scene.beats[0]?.vStart ?? 150;
  const outro = prog(frame, scene.duration - 16, 16, easeInOut);
  const rot = frame * 0.25;

  const groupY = interpolate(lift, [0, 1], [0, -250]);
  const groupScale = interpolate(lift, [0, 1], [1, 0.62]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden", background: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${1 + outro * 0.05})`, opacity: 1 - outro * 0.4 }}>
        <DarkBackdrop accent={accent} frame={frame} intensity={prog(frame, 0, 24)} />
        {/* orbit rings */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, transform: `translateY(${groupY}px)` }}>
          <g transform={`translate(960 432) rotate(${rot})`} opacity={0.55 * prog(frame, 10, 30)}>
            <circle r={150} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4 10" />
          </g>
          <g transform={`translate(960 432) rotate(${-rot * 0.6})`} opacity={0.5 * prog(frame, 18, 30)}>
            <circle r={210} fill="none" stroke="#7fd39b" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="60 22" />
          </g>
          <circle cx={960} cy={432} r={70 + ring * 260} fill="none" stroke="#9be3b2" strokeWidth={2} opacity={(1 - ring) * 0.6} />
        </svg>
        {/* identity group */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${groupY}px) scale(${groupScale})`,
          }}
        >
          <div style={{ transform: `scale(${markIn})`, opacity: Math.min(1, markIn * 1.4) }}>
            <NewlMark size={128} glow={50} />
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 92,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: `${interpolate(word, [0, 1], [0.45, 0.06])}em`,
              opacity: word,
              lineHeight: 1,
            }}
          >
            NEWL AFRICA
          </div>
          <div style={{ marginTop: 22, fontSize: 24, fontWeight: 600, letterSpacing: "0.42em", color: "#9be3b2", opacity: sub * (1 - lift * 0.2) }}>
            DIGITAL SYSTEM TRAINING CENTRE
          </div>
        </div>
        {/* lesson block */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", flexDirection: "column", alignItems: "center", opacity: lessonIn }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ height: 2, width: 120 * lessonIn, background: hexToRgba(accent, 0.8) }} />
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.5em", color: "rgba(255,255,255,0.75)" }}>LESSON</div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#fff",
                background: accent,
                borderRadius: 18,
                padding: "2px 22px",
                clipPath: `inset(0 ${(1 - numberWipe) * 100}% 0 0 round 18px)`,
                boxShadow: `0 0 50px ${hexToRgba(accent, 0.5)}`,
              }}
            >
              {String(lesson.number).padStart(2, "0")}
            </div>
            <div style={{ height: 2, width: 120 * lessonIn, background: hexToRgba(accent, 0.8) }} />
          </div>
          <div
            style={{
              marginTop: 40,
              maxWidth: 1500,
              textAlign: "center",
              fontSize: 72,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              opacity: titleIn,
              transform: `translateY(${(1 - titleIn) * 30}px)`,
            }}
          >
            {lesson.title}
          </div>
          <div style={{ marginTop: 26, fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.72)", opacity: themeIn, transform: `translateY(${(1 - themeIn) * 20}px)` }}>
            {lesson.theme}
          </div>
          <div style={{ marginTop: 52, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 1600 }}>
            {(scene.topics ?? []).map((t, i) => {
              const p = prog(frame, chipsStart + 10 + i * 9, 16);
              return (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 24px",
                    borderRadius: 999,
                    border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
                    background: hexToRgba("#ffffff", 0.06),
                    color: "#fff",
                    fontSize: 23,
                    fontWeight: 600,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 18}px)`,
                  }}
                >
                  <Icon name="circle-check" size={20} color={accent === C.primary ? "#7fd39b" : accent} /> {t}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - prog(frame, 0, 18) }} />
    </AbsoluteFill>
  );
};
