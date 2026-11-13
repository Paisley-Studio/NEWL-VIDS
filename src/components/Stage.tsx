import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Replica } from "../replica/Replica";
import { checksOf, cursorOf, CURSOR_MOVE, imagesOf, layerKeysOf, statesOf, typingOf } from "../stagePlan";
import { C, CANVAS, FONT, hexToRgba, VIEW, WINDOW } from "../theme";
import { beatAt } from "../timeline";
import type { Box, ReplicaState, TimedScene } from "../types";
import { easeInOut, Icon, prog } from "./base";
import { CalloutCard } from "./Callout";
import { useLesson } from "./Frame";

type Cam = { cx: number; cy: number; s: number };
const BASE = VIEW.w / CANVAS.w;
const MAX = BASE * 2.5;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const clampCam = (c: Cam): Cam => {
  const s = clamp(c.s, BASE, MAX);
  const hw = VIEW.w / (2 * s);
  const hh = VIEW.h / (2 * s);
  const cx = CANVAS.w <= hw * 2 ? CANVAS.w / 2 : clamp(c.cx, hw, CANVAS.w - hw);
  const cy = CANVAS.h <= hh * 2 ? CANVAS.h / 2 : clamp(c.cy, hh, CANVAS.h - hh);
  return { cx, cy, s };
};

const boxCam = (b: Box): Cam => {
  const rw = Math.max(40, b[2] - b[0]);
  const rh = Math.max(40, b[3] - b[1]);
  const s = Math.min(VIEW.w / rw, VIEW.h / rh) * 0.93;
  return clampCam({ cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2, s });
};
const FULL: Cam = { cx: CANVAS.w / 2, cy: CANVAS.h / 2, s: BASE };

const toScreen = (c: Cam) => ({ s: c.s, tx: VIEW.w / 2 - c.cx * c.s, ty: VIEW.h / 2 - c.cy * c.s });

export const StageScene: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { accent } = useLesson();
  const beats = scene.beats;
  const bi = beatAt(scene, frame);
  const isReplica = scene.kind === "replica";

  /* ----- per-beat plans ----- */
  const images = useMemo(() => imagesOf(scene), [scene]);
  const states = useMemo(() => statesOf(scene), [scene]);
  const layers = useMemo(() => layerKeysOf(scene), [scene]);
  const typing = useMemo(() => typingOf(scene), [scene]);
  const cursors = useMemo(() => cursorOf(scene), [scene]);
  const checks = useMemo(() => checksOf(scene), [scene]);

  /* ----- replica state (checkbox ticks wait for the click) ----- */
  let state: ReplicaState = states[bi] ?? scene.state ?? {};
  const cur = beats[bi];
  if (isReplica && cur?.state?.checked && cur.cursor?.click && frame < cur.vStart + 6 + CURSOR_MOVE && bi > 0) {
    state = { ...state, checked: states[bi - 1].checked };
  }
  const stateKey = JSON.stringify(state);

  /* ----- measured replica targets ----- */
  const rootRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<Record<string, Box>>({});
  useLayoutEffect(() => {
    if (!isReplica || !rootRef.current) return;
    const root = rootRef.current.getBoundingClientRect();
    const k = CANVAS.w / root.width;
    const map: Record<string, Box> = {};
    rootRef.current.querySelectorAll<HTMLElement>("[data-hl]").forEach((el) => {
      const r = el.getBoundingClientRect();
      map[el.dataset.hl as string] = [(r.left - root.left) * k, (r.top - root.top) * k, (r.right - root.left) * k, (r.bottom - root.top) * k];
    });
    setTargets(map);
  }, [isReplica, stateKey]);

  const resolve = useCallback(
    (t: Box | string | undefined): Box | undefined => (typeof t === "string" ? targets[t] : t),
    [targets],
  );

  /* ----- camera ----- */
  const camSpec = (i: number): Cam => {
    let spec = beats[i]?.cam;
    for (let j = i; spec === undefined && j >= 0; j--) spec = beats[j]?.cam;
    if (!spec || spec === "full") return FULL;
    if (typeof spec === "string" && spec.startsWith("modal-")) {
      const m = targets["modal"];
      if (!m) return FULL;
      const h = m[3] - m[1];
      const part = spec === "modal-top" ? [0, 0.56] : spec === "modal-mid" ? [0.22, 0.78] : [0.44, 1];
      return boxCam([m[0] - 40, m[1] + h * part[0] - 20, m[2] + 40, m[1] + h * part[1] + 20]);
    }
    const box = resolve(spec as Box | string);
    return box ? boxCam(box) : FULL;
  };
  const camIn = (i: number, f: number): Cam => {
    const b = beats[i];
    const target = camSpec(i);
    const len = (beats[i + 1]?.vStart ?? scene.duration) - b.vStart;
    const d = 1 + 0.024 * easeInOut(clamp((f - b.vStart) / Math.max(1, len), 0, 1));
    const drifted = { ...target, s: target.s * d };
    if (i === 0) return clampCam(drifted);
    const from = camIn(i - 1, b.vStart);
    const m = easeInOut(clamp((f - b.vStart) / 30, 0, 1));
    return clampCam({
      cx: from.cx + (drifted.cx - from.cx) * m,
      cy: from.cy + (drifted.cy - from.cy) * m,
      s: Math.exp(Math.log(from.s) + (Math.log(drifted.s) - Math.log(from.s)) * m),
    });
  };
  const cam = camIn(bi, frame);
  const prev = camIn(beatAt(scene, Math.max(0, frame - 1)), Math.max(0, frame - 1));
  const speed = Math.abs(cam.cx - prev.cx) * cam.s + Math.abs(cam.cy - prev.cy) * cam.s + Math.abs(cam.s - prev.s) * 900;
  const blur = speed > 6 ? Math.min(1.3, (speed - 6) / 30) : 0;
  const { s, tx, ty } = toScreen(cam);
  const sx = (x: number) => tx + x * s;
  const sy = (y: number) => ty + y * s;

  /* ----- image cross-fades (screens) ----- */
  const imgNow = images[bi];
  const imgPrev = bi > 0 ? images[bi - 1] : imgNow;
  const fadeIn = imgNow !== imgPrev ? prog(frame, beats[bi].vStart, 14) : 1;

  /* ----- highlights for current + fading previous beat ----- */
  const hlLayers: { box: Box; label?: string; o: number }[] = [];
  const pushHl = (i: number, o: number) => {
    (beats[i]?.hl ?? []).forEach((h) => {
      const box = resolve(h.box ?? h.target);
      if (box && o > 0.001) hlLayers.push({ box, label: h.label, o });
    });
  };
  pushHl(bi, prog(frame, beats[bi].vStart + 4, 12));
  if (bi > 0) pushHl(bi - 1, 1 - prog(frame, beats[bi].vStart, 9));
  const dim = hlLayers.reduce((m, h) => Math.max(m, h.o), 0);
  const pulse = 0.75 + 0.25 * Math.sin(frame / 7);

  /* ----- cursor ----- */
  const pt = (to: [number, number] | string): [number, number] | undefined => {
    if (Array.isArray(to)) return to;
    const b = targets[to];
    return b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : undefined;
  };
  let cursorEl: React.ReactNode = null;
  const firstCursor = cursors[0];
  if (firstCursor && frame >= firstCursor.frame - 16) {
    let k = 0;
    cursors.forEach((c, i) => {
      if (frame >= c.frame) k = i;
    });
    const c = cursors[k];
    const target = pt(c.to);
    const before = k > 0 ? pt(cursors[k - 1].to) : undefined;
    if (target) {
      const origin = before ?? [target[0] + 170, target[1] + 150];
      const m = easeInOut(clamp((frame - c.frame) / CURSOR_MOVE, 0, 1));
      const x = origin[0] + (target[0] - origin[0]) * m;
      const y = origin[1] + (target[1] - origin[1]) * m;
      const clickF = c.frame + CURSOR_MOVE;
      const sinceClick = frame - clickF;
      const pressing = c.click && sinceClick >= 0 && sinceClick < 6;
      const lastBeatWithCursor = c.beat;
      const visible = Math.min(prog(frame, firstCursor.frame - 16, 12), bi - lastBeatWithCursor > 1 ? 1 - prog(frame, beats[bi].vStart, 10) : 1);
      cursorEl = (
        <>
          {c.click && sinceClick >= 0 && sinceClick < 22 ? (
            <div
              style={{
                position: "absolute",
                left: sx(x),
                top: sy(y),
                width: 0,
                height: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -(10 + sinceClick * 2.2),
                  top: -(10 + sinceClick * 2.2),
                  width: 2 * (10 + sinceClick * 2.2),
                  height: 2 * (10 + sinceClick * 2.2),
                  borderRadius: "50%",
                  border: `3px solid ${accent}`,
                  background: hexToRgba(accent, 0.15),
                  opacity: 1 - sinceClick / 22,
                }}
              />
            </div>
          ) : null}
          <svg
            width={34}
            height={40}
            viewBox="0 0 34 40"
            style={{
              position: "absolute",
              left: sx(x) - 4,
              top: sy(y) - 2,
              opacity: visible,
              transform: `scale(${pressing ? 0.86 : 1})`,
              transformOrigin: "4px 2px",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.28))",
            }}
          >
            <path d="M4 2 L4 31 L11.5 24.5 L16.5 36 L21.5 33.8 L16.6 22.6 L26.5 22.6 Z" fill="#111" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
          </svg>
        </>
      );
    }
  }

  const layerNow = layers[bi];

  return (
    <>
      {/* browser window */}
      <div
        style={{
          position: "absolute",
          left: WINDOW.x,
          top: WINDOW.y,
          width: WINDOW.w,
          height: WINDOW.bar + VIEW.h,
          borderRadius: 22,
          background: C.surface,

          border: `1px solid ${C.border}`,
          boxShadow: "0 22px 48px rgba(21,80,42,0.13)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: WINDOW.bar, display: "flex", alignItems: "center", padding: "0 18px", background: "#fbfdfc", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["#f26b5f", "#f5bd4f", "#5bc161"].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: C.bg,
                borderRadius: 999,
                padding: "5px 18px",
                fontSize: 14,
                fontWeight: 500,
                color: C.textSoft,
                fontFamily: FONT,
              }}
            >
              <Icon name="lock" size={11} color={C.primary} /> NEWL AFRICA · Projects · Teams · Financials
            </div>
          </div>
          <div style={{ width: 52 }} />
        </div>
        {/* viewport */}
        <div style={{ position: "absolute", left: 0, top: WINDOW.bar, width: VIEW.w, height: VIEW.h, overflow: "hidden", background: C.bg }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CANVAS.w,
              height: CANVAS.h,
              transformOrigin: "0 0",
              transform: `translate(${tx}px, ${ty}px) scale(${s})`,
              filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
            }}
          >
            {isReplica ? (
              <div ref={rootRef} style={{ position: "absolute", left: 0, top: 0, width: CANVAS.w, height: CANVAS.h }}>
                <Replica state={state} frame={frame} />
              </div>
            ) : (
              <>
                {imgPrev !== imgNow && fadeIn < 1 ? (
                  <Img src={staticFile(`screenshots/${imgPrev}.png`)} style={{ position: "absolute", width: CANVAS.w, height: CANVAS.h }} />
                ) : null}
                <Img src={staticFile(`screenshots/${imgNow}.png`)} style={{ position: "absolute", width: CANVAS.w, height: CANVAS.h, opacity: fadeIn }} />
              </>
            )}
          </div>

          {/* overlays in screen space */}
          <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
            {/* typed text */}
            {typing.map((a, i) => {
              if (frame < a.start || layers[a.beat] !== layerNow) return null;
              const box = resolve(a.box ?? a.target);
              if (!box) return null;
              const n = Math.floor(interpolate(frame, [a.start, a.start + a.dur], [0, a.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              const typingNow = frame < a.start + a.dur + 12;
              const caret = typingNow && Math.floor(frame / 8) % 2 === 0;
              const inset = 2.2 * s;
              return (
                <div
                  key={`t${i}`}
                  style={{
                    position: "absolute",
                    left: sx(box[0]),
                    top: sy(box[1]),
                    width: (box[2] - box[0]) * s,
                    height: (box[3] - box[1]) * s,
                    borderRadius: 16 * s,
                    border: `${2.2 * s}px solid ${typingNow ? C.primary : "#e8f0ec"}`,
                    boxShadow: typingNow ? `0 0 0 ${4 * s}px rgba(30,107,58,.12)` : undefined,
                    background: "#fff",
                    boxSizing: "border-box",
                    padding: a.multiline ? `${16 * s - inset}px ${19 * s}px` : `0 ${19 * s}px`,
                    display: "flex",
                    alignItems: a.multiline ? "flex-start" : "center",
                    fontSize: 20.3 * s,
                    lineHeight: 1.5,
                    color: C.text,
                    overflow: "hidden",
                    whiteSpace: a.multiline ? "normal" : "nowrap",
                  }}
                >
                  <span>
                    {a.text.slice(0, n)}
                    <span style={{ display: "inline-block", width: 1.6 * s, height: 24 * s, background: caret ? C.text : "transparent", marginLeft: 1, verticalAlign: "middle" }} />
                  </span>
                </div>
              );
            })}

            {/* ticked checkboxes */}
            {checks.map((c, i) => {
              if (frame < c.frame || layers[c.beat] !== layerNow) return null;
              const p = prog(frame, c.frame, 6);
              const w = (c.box[2] - c.box[0]) * s;
              return (
                <div
                  key={`c${i}`}
                  style={{
                    position: "absolute",
                    left: sx(c.box[0]),
                    top: sy(c.box[1]),
                    width: w,
                    height: w,
                    borderRadius: 4 * s,
                    background: "#0075ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${0.6 + 0.4 * p})`,
                    opacity: p,
                  }}
                >
                  <Icon name="check" size={w * 0.7} color="#fff" />
                </div>
              );
            })}

            {/* spotlight */}
            {dim > 0 ? (
              <svg width={VIEW.w} height={VIEW.h} style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <mask id={`m-${scene.id}`}>
                    <rect width={VIEW.w} height={VIEW.h} fill="white" />
                    {hlLayers.map((h, i) => (
                      <rect
                        key={i}
                        x={sx(h.box[0]) - 8}
                        y={sy(h.box[1]) - 8}
                        width={(h.box[2] - h.box[0]) * s + 16}
                        height={(h.box[3] - h.box[1]) * s + 16}
                        rx={14}
                        fill="black"
                        opacity={h.o}
                      />
                    ))}
                  </mask>
                </defs>
                <rect width={VIEW.w} height={VIEW.h} fill="rgba(6,22,13,0.42)" opacity={dim} mask={`url(#m-${scene.id})`} />
                {hlLayers.map((h, i) => (
                  <g key={`r${i}`} opacity={h.o}>
                    <rect
                      x={sx(h.box[0]) - 8}
                      y={sy(h.box[1]) - 8}
                      width={(h.box[2] - h.box[0]) * s + 16}
                      height={(h.box[3] - h.box[1]) * s + 16}
                      rx={14}
                      fill="none"
                      stroke={accent}
                      strokeOpacity={0.25 * pulse}
                      strokeWidth={12}
                    />
                    <rect
                      x={sx(h.box[0]) - 8}
                      y={sy(h.box[1]) - 8}
                      width={(h.box[2] - h.box[0]) * s + 16}
                      height={(h.box[3] - h.box[1]) * s + 16}
                      rx={14}
                      fill="none"
                      stroke={accent}
                      strokeWidth={3.5}
                    />
                  </g>
                ))}
              </svg>
            ) : null}
            {hlLayers.map((h, i) => {
              if (!h.label) return null;
              const top = sy(h.box[1]) - 8;
              const above = top > 64;
              return (
                <div
                  key={`l${i}`}
                  style={{
                    position: "absolute",
                    left: clamp(sx(h.box[0]) - 8, 12, VIEW.w - 420),
                    top: above ? top - 50 : sy(h.box[3]) + 16,
                    background: accent,
                    color: "#fff",
                    fontSize: 19,
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: `0 8px 22px ${hexToRgba(accent, 0.35)}`,
                    opacity: h.o,
                    transform: `translateY(${(1 - h.o) * (above ? 10 : -10)}px)`,
                  }}
                >
                  {h.label}
                </div>
              );
            })}
            {cursorEl}
          </div>
          {isReplica ? (
            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: 14,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                color: C.textSoft,
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                padding: "6px 14px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Icon name="code" size={12} color={C.textSoft} /> Interface rendered from the application's source · illustrative data
            </div>
          ) : null}
        </div>
      </div>
      {/* callouts sit above the window */}
      {beats.map((b, i) =>
        b.callout && (i === bi || i === bi - 1) ? (
          <CalloutCard
            key={`co${i}`}
            callout={b.callout}
            accent={accent}
            appear={prog(frame, b.vStart + 12, 14)}
            leave={i === bi - 1 ? prog(frame, beats[bi].vStart, 8) : 0}
            area="stage"
          />
        ) : null,
      )}
    </>
  );
};
