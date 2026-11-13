import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, easeInOut, Icon, NewlMark, prog } from "../components/base";
import { useLesson } from "../components/Frame";
import { C, FONT, hexToRgba } from "../theme";
import { beatAt } from "../timeline";
import type { TimedScene } from "../types";
import { DarkBackdrop } from "./Opening";

/** NEWL AFRICA lesson summary. */
export const ClosingScene: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { tl, accent } = useLesson();
  const lesson = tl.lesson;
  const bi = beatAt(scene, frame);
  const items = scene.takeaways ?? [];
  // first beat at which each takeaway becomes visible
  const appearAt = items.map((_, i) => {
    const b = scene.beats.find((bt) => typeof bt.show === "number" && bt.show > i);
    return b ? b.vStart : scene.duration;
  });
  const nextBeat = scene.beats.find((b) => b.next);
  const nextIn = nextBeat ? prog(frame, nextBeat.vStart + 6, 18) : 0;
  const head = prog(frame, 4, 24);
  void bi;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <DarkBackdrop accent={accent} frame={frame + 400} intensity={0.75} />
      <div style={{ position: "absolute", left: 160, top: 170, width: 560, opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>
        <NewlMark size={96} glow={40} />
        <div style={{ marginTop: 34, fontSize: 22, fontWeight: 700, letterSpacing: "0.32em", color: "#9be3b2" }}>LESSON {String(lesson.number).padStart(2, "0")} · SUMMARY</div>
        <div style={{ marginTop: 18, fontSize: 60, fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.08 }}>{lesson.shortTitle}</div>
        <div style={{ marginTop: 26, height: 3, width: 140 * head, background: accent, borderRadius: 2 }} />
        <div style={{ marginTop: 26, fontSize: 22, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Projects · Teams · Daily Logs · Financials — unified</div>
      </div>
      <div style={{ position: "absolute", left: 820, right: 160, top: 210, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((t, i) => {
          const p = prog(frame, appearAt[i] + i * 4, 18);
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "26px 32px",
                borderRadius: 24,
                background: hexToRgba("#ffffff", 0.07),
                border: `1px solid ${hexToRgba("#ffffff", 0.12)}`,
                opacity: p,
                transform: `translateX(${(1 - p) * 40}px)`,
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 26, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="check" size={22} color="#fff" />
              </div>
              <div style={{ fontSize: 31, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>{t}</div>
            </div>
          );
        })}
        {scene.next ? (
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14, fontSize: 25, fontWeight: 600, color: "#9be3b2", opacity: nextIn, transform: `translateY(${(1 - nextIn) * 16}px)` }}>
            <Icon name="arrow-right" size={20} color="#9be3b2" /> {scene.next}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** KEYPOLE TECHNOLOGIES production credit — always the final frames of every lesson. */
export const CreditsScene: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const bg = prog(frame, 0, 14);
  const kicker = prog(frame, 10, 22);
  const logo = prog(frame, 18, 40, ease);
  const blur = interpolate(logo, [0, 1], [14, 0]);
  const scale = interpolate(logo, [0, 1], [0.93, 1]);
  const sweep = prog(frame, 56, 46, easeInOut);
  const ringP = prog(frame, 22, 60);
  const words = ["Technology.", "Creativity.", "Excellence."];
  const tagStart = 70;
  void scene;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#000", opacity: bg }} />
      <div
        style={{
          position: "absolute",
          left: (1920 - 1080) / 2,
          top: 110,
          width: 1080,
          height: 720,
          opacity: logo,
          transform: `scale(${scale})`,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        }}
      >
        <Img src={staticFile("branding/keypole-technologies-logo.png")} style={{ width: 1080, height: 720, display: "block" }} />
        {/* light sweep: colour-dodge leaves pure black untouched, so only the logo glints */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            mixBlendMode: "color-dodge",
            background: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.55) ${sweep * 140 - 18}%, transparent ${sweep * 140 - 6}%)`,
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        />
      </div>
      {/* drawn above the logo (whose background is pure black) so nothing is clipped by its edges */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        <circle cx={960} cy={420} r={220 + ringP * 360} fill="none" stroke="#ffffff" strokeOpacity={(1 - ringP) * 0.18} strokeWidth={1.5} />
      </svg>
      <div style={{ position: "absolute", top: 122, left: 0, right: 0, textAlign: "center", fontSize: 19, fontWeight: 600, letterSpacing: "0.5em", color: "rgba(255,255,255,0.55)", opacity: kicker }}>
        TRAINING EXPERIENCE DESIGNED &amp; PRODUCED BY
      </div>
      <div style={{ position: "absolute", top: 838, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
        {words.map((w, i) => {
          const p = prog(frame, tagStart + i * 10, 20);
          return (
            <span key={w} style={{ fontSize: 34, fontWeight: 500, letterSpacing: "0.12em", color: "#fff", opacity: p * 0.9, transform: `translateY(${(1 - p) * 12}px)`, display: "inline-block" }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 905, left: "50%", width: 320 * prog(frame, tagStart + 30, 30), height: 1, background: "rgba(255,255,255,0.25)", transform: "translateX(-50%)" }} />
      <div style={{ position: "absolute", bottom: 54, left: 0, right: 0, textAlign: "center", fontSize: 17, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", opacity: prog(frame, tagStart + 40, 24) }}>
        NEWL AFRICA · Digital System Training Centre
      </div>
      <AbsoluteFill style={{ background: C.ink, opacity: 0 }} />
    </AbsoluteFill>
  );
};
