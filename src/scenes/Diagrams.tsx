import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { easeInOut, easeOutBack, Icon, NewlMark, prog } from "../components/base";
import { CalloutCard } from "../components/Callout";
import { SceneTitle, useLesson } from "../components/Frame";
import { C, FONT, hexToRgba } from "../theme";
import { beatAt } from "../timeline";
import type { TimedScene } from "../types";

/* ----------------------------------------------------------- reveal helpers */
const shows = (show: number | number[] | undefined, i: number) => (Array.isArray(show) ? show.includes(i) : (show ?? 0) > i);

const useReveal = (scene: TimedScene) => {
  const frame = useCurrentFrame();
  const bi = beatAt(scene, frame);
  // carry forward `show` from earlier beats
  let lastShow: number | number[] | undefined;
  const resolved = scene.beats.map((b) => (lastShow = b.show ?? lastShow));
  const appear = (i: number) => {
    const k = resolved.findIndex((s) => shows(s, i));
    return k < 0 ? Infinity : scene.beats[k].vStart;
  };
  const visible = (i: number) => {
    const at = appear(i);
    return at === Infinity ? 0 : prog(frame, at + 4, 18);
  };
  const cur = scene.beats[bi];
  const focus = cur?.focus;
  const footerAt = scene.beats.find((b) => b.footer)?.vStart ?? Infinity;
  const footer = footerAt === Infinity ? 0 : prog(frame, footerAt + 4, 18);
  return { frame, bi, appear, visible, focus, footer, cur };
};

const IconTile: React.FC<{ icon: string; accent: string; size?: number; solid?: boolean }> = ({ icon, accent, size = 64, solid }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      background: solid ? accent : hexToRgba(accent, 0.12),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: solid ? `0 10px 26px ${hexToRgba(accent, 0.35)}` : undefined,
    }}
  >
    <Icon name={icon} size={size * 0.44} color={solid ? "#fff" : accent} />
  </div>
);

const Footer: React.FC<{ icon?: string; text: string; p: number; accent: string; top?: number }> = ({ icon, text, p, accent, top = 880 }) =>
  p > 0 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 34px",
          borderRadius: 999,
          background: C.surface,
          border: `2px solid ${hexToRgba(accent, 0.45)}`,
          boxShadow: `0 16px 40px ${hexToRgba(accent, 0.16)}`,
          fontSize: 27,
          fontWeight: 700,
          color: C.text,
        }}
      >
        {icon ? <Icon name={icon} size={24} color={accent} /> : null}
        {text}
      </div>
    </div>
  ) : null;

const cardBase = (focused: boolean, dimmed: boolean, accent: string): React.CSSProperties => ({
  background: C.surface,
  borderRadius: 28,
  border: `2px solid ${focused ? accent : C.border}`,
  boxShadow: focused ? `0 26px 60px ${hexToRgba(accent, 0.22)}` : "0 14px 40px rgba(21,80,42,0.07)",
  opacity: dimmed ? 0.5 : 1,
  transition: "none",
});

/* ------------------------------------------------------------------ cards */
const Cards: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, focus, footer } = useReveal(scene);
  const d = scene.data;
  const cols = d.columns ?? 3;
  const items = d.items as { icon: string; title: string; body: string }[];
  const rows = Math.ceil(items.length / cols);
  const top = d.subtitle ? 360 : 320;
  return (
    <>
      <SceneTitle title={d.title} subtitle={d.subtitle} />
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
          gap: 28,
          justifyItems: "stretch",
        }}
      >
        {items.map((it, i) => {
          const p = visible(i);
          const f = focus === i;
          const dim = focus !== undefined && !f;
          return (
            <div
              key={i}
              style={{
                ...cardBase(f, dim && p > 0, accent),
                padding: rows > 1 ? "30px 30px 32px" : "38px 36px 40px",
                opacity: p * (dim ? 0.55 : 1),
                transform: `translateY(${(1 - p) * 34}px) scale(${f ? 1.025 : 1})`,
                gridColumn: items.length === 7 && i >= 4 ? undefined : undefined,
              }}
            >
              <IconTile icon={it.icon} accent={accent} solid={f} size={rows > 1 ? 58 : 70} />
              <div style={{ marginTop: rows > 1 ? 20 : 28, fontSize: rows > 1 ? 28 : 33, fontWeight: 800, color: C.text, letterSpacing: "-0.015em" }}>{it.title}</div>
              <div style={{ marginTop: 10, fontSize: rows > 1 ? 21 : 24, lineHeight: 1.45, color: C.textSoft, fontWeight: 500 }}>{it.body}</div>
            </div>
          );
        })}
      </div>
      {d.footer ? <Footer icon={d.footer.icon} text={d.footer.text} p={footer} accent={accent} top={rows > 1 ? 905 : 830} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ tiers */
const Tiers: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, focus } = useReveal(scene);
  const d = scene.data;
  const items = d.items as { icon: string; title: string; body: string; tag: string }[];
  return (
    <>
      <SceneTitle title={d.title} />
      <div style={{ position: "absolute", left: 160, right: 160, top: 280, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((it, i) => {
          const p = visible(i);
          const f = focus === i;
          const dim = focus !== undefined && !f;
          const isRole = it.tag === "Sign-in role";
          return (
            <div key={i} style={{ position: "relative" }}>
              {i > 0 ? <div style={{ position: "absolute", left: 63, top: -22, width: 3, height: 22, background: hexToRgba(accent, 0.3 * p) }} /> : null}
              <div
                style={{
                  ...cardBase(f, false, accent),
                  display: "flex",
                  alignItems: "center",
                  gap: 30,
                  padding: "24px 32px",
                  opacity: p * (dim ? 0.5 : 1),
                  transform: `translateX(${(1 - p) * -40}px) scale(${f ? 1.012 : 1})`,
                  borderStyle: i === 0 ? "dashed" : "solid",
                }}
              >
                <IconTile icon={it.icon} accent={accent} solid={isRole} size={66} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: "-0.015em" }}>{it.title}</div>
                  <div style={{ fontSize: 22, color: C.textSoft, marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>{it.body}</div>
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: isRole ? accent : C.bg,
                    color: isRole ? "#fff" : C.textSoft,
                    border: isRole ? "none" : `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.tag}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------- flow */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; accent: string; frame: number; curve?: boolean; dashed?: boolean }> = ({
  x1,
  y1,
  x2,
  y2,
  p,
  accent,
  frame,
  curve,
  dashed,
}) => {
  if (p <= 0) return null;
  const path = curve ? `M${x1},${y1} C${x1},${y1 + 140} ${x2},${y2 + 140} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
  const len = curve ? Math.hypot(x2 - x1, y2 - y1) + 300 : Math.hypot(x2 - x1, y2 - y1);
  const t = ((frame % 45) / 45) * (p >= 1 ? 1 : 0);
  const px = x1 + (x2 - x1) * t;
  const py = y1 + (y2 - y1) * t;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g>
      <path d={path} fill="none" stroke={hexToRgba(accent, 0.55)} strokeWidth={3} strokeDasharray={dashed ? "8 8" : `${len}`} strokeDashoffset={dashed ? 0 : len * (1 - p)} opacity={dashed ? p : 1} />
      {p >= 1 && !curve ? (
        <>
          <polygon
            points={`${x2},${y2} ${x2 - 14 * Math.cos(ang - 0.45)},${y2 - 14 * Math.sin(ang - 0.45)} ${x2 - 14 * Math.cos(ang + 0.45)},${y2 - 14 * Math.sin(ang + 0.45)}`}
            fill={accent}
          />
          <circle cx={px} cy={py} r={6} fill={accent} opacity={0.85} />
        </>
      ) : null}
    </g>
  );
};

const Flow: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, focus, frame, cur } = useReveal(scene);
  const d = scene.data;
  const nodes = d.nodes as { icon: string; title: string; body: string }[];
  const branches = (d.branches ?? []) as { icon: string; title: string; body: string; tone: string }[];
  const n = nodes.length;
  const W = 1600;
  const nodeW = n >= 5 ? 284 : 330;
  const gap = (W - n * nodeW) / (n - 1);
  const y = branches.length ? 320 : 372;
  const xs = nodes.map((_, i) => 160 + i * (nodeW + gap));
  const nodeH = branches.length ? 300 : 360;
  return (
    <>
      <SceneTitle title={d.title} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {nodes.slice(1).map((_, i) => (
          <Arrow key={i} x1={xs[i] + nodeW + 8} y1={y + 80} x2={xs[i + 1] - 10} y2={y + 80} p={visible(i + 1)} accent={accent} frame={frame + i * 9} />
        ))}
        {branches.length
          ? branches.map((b, j) => {
              const bx = xs[n - 1] + nodeW / 2;
              const tx = j === 0 ? 1180 : 620;
              return <Arrow key={`b${j}`} x1={bx} y1={y + nodeH + 6} x2={tx + 170} y2={y + nodeH + 120} p={visible(n + j)} accent={b.tone === "good" ? C.primary : C.accent} frame={frame} />;
            })
          : null}
        {branches.length > 1 && visible(n + 1) > 0 ? (
          <path
            d={`M${620},${y + nodeH + 210} C ${420},${y + nodeH + 210} ${xs[1] + nodeW / 2},${y + nodeH + 140} ${xs[1] + nodeW / 2},${y + nodeH + 8}`}
            fill="none"
            stroke={hexToRgba(C.accent, 0.7)}
            strokeWidth={3}
            strokeDasharray="10 9"
            opacity={visible(n + 1)}
          />
        ) : null}
      </svg>
      {nodes.map((nd, i) => {
        const p = visible(i);
        const f = focus === i;
        const dim = focus !== undefined && !f;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: xs[i],
              top: y,
              width: nodeW,
              minHeight: nodeH,
              ...cardBase(f, false, accent),
              padding: branches.length ? "28px 24px" : "38px 24px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              opacity: p * (dim ? 0.55 : 1),
              transform: `translateY(${(1 - p) * 30}px) scale(${f ? 1.04 : 1})`,
            }}
          >
            <div style={{ position: "absolute", top: -18, left: 24, fontSize: 15, fontWeight: 800, color: "#fff", background: accent, borderRadius: 999, padding: "5px 12px" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <IconTile icon={nd.icon} accent={accent} solid={f} size={branches.length ? 78 : 90} />
            <div style={{ marginTop: 24, fontSize: branches.length ? 27 : 29, fontWeight: 800, color: C.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{nd.title}</div>
            <div style={{ marginTop: 12, fontSize: branches.length ? 19.5 : 21, color: C.textSoft, lineHeight: 1.42, fontWeight: 500 }}>{nd.body}</div>
          </div>
        );
      })}
      {branches.map((b, j) => {
        const p = visible(n + j);
        const tone = b.tone === "good" ? C.primary : C.accent;
        const left = j === 0 ? 1180 : 620;
        return (
          <div
            key={`br${j}`}
            style={{
              position: "absolute",
              left,
              top: y + nodeH + 128,
              width: 340,
              background: C.surface,
              borderRadius: 24,
              border: `2px solid ${tone}`,
              padding: "20px 24px",
              display: "flex",
              gap: 18,
              alignItems: "center",
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
              boxShadow: `0 16px 40px ${hexToRgba(tone, 0.18)}`,
            }}
          >
            <IconTile icon={b.icon} accent={tone} solid size={56} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>{b.title}</div>
              <div style={{ fontSize: 19, color: C.textSoft, marginTop: 4, fontWeight: 500 }}>{b.body}</div>
            </div>
          </div>
        );
      })}
      {cur?.callout ? (
        <CalloutCard callout={cur.callout} accent={accent} appear={prog(frame, cur.vStart + 10, 16)} leave={0} area="frame" />
      ) : null}
    </>
  );
};

/* ---------------------------------------------------------------- formula */
const Formula: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, appear, frame } = useReveal(scene);
  const d = scene.data;
  const rows = d.rows as { label: string; value: number; op: string }[];
  const count = (i: number, v: number) => {
    const at = appear(i);
    if (at === Infinity) return 0;
    return Math.round(interpolate(frame, [at + 6, at + 34], [0, v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut }));
  };
  const resP = visible(rows.length);
  const noteP = visible(rows.length + 1);
  const fmt = (n: number) => n.toLocaleString("en-KE");
  return (
    <>
      <SceneTitle title={d.title} subtitle={d.subtitle} />
      <div
        style={{
          position: "absolute",
          left: 360,
          right: 360,
          top: 360,
          background: C.surface,
          borderRadius: 34,
          border: `1px solid ${C.border}`,
          boxShadow: "0 30px 80px rgba(21,80,42,0.10)",
          padding: "34px 56px 38px",
        }}
      >
        {rows.map((r, i) => {
          const p = visible(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "18px 0",
                borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : undefined,
                opacity: Math.max(0.12, p),
                transform: `translateX(${(1 - p) * -24}px)`,
              }}
            >
              <div style={{ width: 54, fontSize: 44, fontWeight: 800, color: r.op ? C.danger : accent }}>{r.op || "+"}</div>
              <div style={{ flex: 1, fontSize: 32, fontWeight: 600, color: C.text }}>{r.label}</div>
              <div style={{ fontSize: 46, fontWeight: 800, color: r.op ? C.danger : C.primary, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                <span style={{ fontSize: 26, fontWeight: 700, marginRight: 10, opacity: 0.7 }}>KES</span>
                {fmt(count(i, r.value))}
              </div>
            </div>
          );
        })}
        <div style={{ height: 4, background: accent, borderRadius: 2, margin: "14px 0 6px", transformOrigin: "left", transform: `scaleX(${resP})` }} />
        <div style={{ display: "flex", alignItems: "center", padding: "20px 0 4px", opacity: Math.max(0.1, resP) }}>
          <div style={{ width: 54, fontSize: 44, fontWeight: 800, color: accent }}>=</div>
          <div style={{ flex: 1, fontSize: 38, fontWeight: 800, color: C.text }}>{d.result.label}</div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 800,
              color: C.primary,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              textShadow: resP > 0.5 ? `0 0 30px ${hexToRgba(C.primary, 0.25)}` : undefined,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, marginRight: 12, opacity: 0.7 }}>KES</span>
            {fmt(count(rows.length, d.result.value))}
          </div>
        </div>
      </div>
      {d.note ? (
        <div
          style={{
            position: "absolute",
            left: 360,
            right: 360,
            top: 900,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 25,
            fontWeight: 600,
            color: C.text,
            opacity: noteP,
            transform: `translateY(${(1 - noteP) * 14}px)`,
          }}
        >
          <Icon name="circle-info" size={24} color={C.accent} /> {d.note}
        </div>
      ) : null}
    </>
  );
};

/* ---------------------------------------------------------------- compare */
const Compare: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, focus, frame, cur } = useReveal(scene);
  const d = scene.data;
  const sides = [d.left, d.right] as { icon: string; title: string; tag: string; points: string[] }[];
  const footP = visible(2);
  return (
    <>
      <SceneTitle title={d.title} />
      {sides.map((sd, i) => {
        const p = visible(i);
        const f = focus === i;
        const dim = focus !== undefined && !f;
        const at = i === 0 ? 0 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i === 0 ? 160 : 1000,
              top: 300,
              width: 760,
              ...cardBase(f, false, accent),
              padding: "40px 44px",
              opacity: p * (dim ? 0.55 : 1),
              transform: `translateY(${(1 - p) * 30}px) scale(${f ? 1.015 : 1})`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <IconTile icon={sd.icon} accent={accent} solid={f} size={74} />
              <div>
                <div style={{ fontSize: 38, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{sd.title}</div>
                <div style={{ marginTop: 6, display: "inline-block", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent }}>{sd.tag}</div>
              </div>
            </div>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18 }}>
              {sd.points.map((pt, k) => {
                const appearAt = scene.beats.find((b) => shows(b.show, at))?.vStart ?? 0;
                const pp = prog(frame, appearAt + 10 + k * 7, 14);
                return (
                  <div key={k} style={{ display: "flex", gap: 16, alignItems: "center", opacity: pp, transform: `translateX(${(1 - pp) * 16}px)` }}>
                    <div style={{ width: 30, height: 30, borderRadius: 15, background: hexToRgba(accent, 0.14), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check" size={14} color={accent} />
                    </div>
                    <div style={{ fontSize: 25, color: C.text, fontWeight: 500 }}>{pt}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 960 - 34,
          top: 520,
          width: 68,
          height: 68,
          borderRadius: 34,
          background: C.text,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 800,
          opacity: visible(1),
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        VS
      </div>
      {d.footer ? <Footer text={d.footer} p={footP * (cur?.callout ? 1 - prog(frame, cur.vStart, 10) : 1)} accent={accent} top={900} /> : null}
      {cur?.callout ? <CalloutCard callout={cur.callout} accent={accent} appear={prog(frame, cur.vStart + 10, 16)} leave={0} area="frame" /> : null}
    </>
  );
};

/* ----------------------------------------------------------------- matrix */
const Matrix: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, appear, frame } = useReveal(scene);
  const d = scene.data;
  const rows = d.rows as { event: string; to: string; inapp: boolean; sms: boolean }[];
  const cols = "1.55fr 1fr 150px 150px";
  const Pill: React.FC<{ on: boolean; icon: string; color: string }> = ({ on, icon, color }) =>
    on ? (
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 23, background: hexToRgba(color, 0.14) }}>
        <Icon name={icon} size={20} color={color} />
      </div>
    ) : (
      <div style={{ width: 46, textAlign: "center", fontSize: 26, color: C.textLight }}>–</div>
    );
  return (
    <>
      <SceneTitle title={d.title} />
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 262,
          background: C.surface,
          borderRadius: 28,
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 60px rgba(21,80,42,0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: cols, padding: "16px 34px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          {d.columns.map((c: string, i: number) => (
            <div key={c} style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSoft, textAlign: i >= 2 ? "center" : "left" }}>
              {c}
            </div>
          ))}
        </div>
        {rows.map((r, i) => {
          const at = appear(i);
          const p = at === Infinity ? 0 : prog(frame, at + 4 + (i % 4) * 5, 14);
          const fresh = at !== Infinity && frame - at < 70 && frame >= at;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                alignItems: "center",
                padding: "7px 34px",
                minHeight: 52,
                borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : undefined,
                opacity: Math.max(0.16, p),
                background: fresh ? hexToRgba(accent, 0.05 * (1 - (frame - at) / 70)) : undefined,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{r.event}</div>
              <div style={{ fontSize: 21, color: C.textSoft, fontWeight: 500 }}>{r.to}</div>
              <div style={{ display: "flex", justifyContent: "center", opacity: p }}>
                <Pill on={r.inapp} icon="bell" color={C.primary} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", opacity: p }}>
                <Pill on={r.sms} icon="comment-sms" color={accent} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "none" }}>{visible(0)}</div>
    </>
  );
};

/* ----------------------------------------------------------- architecture */
const Architecture: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, frame } = useReveal(scene);
  const d = scene.data;
  const Node: React.FC<{ x: number; y: number; w?: number; icon: string; title: string; sub: string; p: number; mark?: boolean; color?: string }> = ({
    x,
    y,
    w = 340,
    icon,
    title,
    sub,
    p,
    mark,
    color = accent,
  }) => (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - 70,
        width: w,
        background: C.surface,
        borderRadius: 26,
        border: `2px solid ${p >= 1 ? hexToRgba(color, 0.5) : C.border}`,
        boxShadow: `0 20px 50px ${hexToRgba(color, 0.14)}`,
        padding: "22px 24px",
        display: "flex",
        gap: 18,
        alignItems: "center",
        opacity: p,
        transform: `scale(${0.9 + 0.1 * easeOutBack(Math.min(1, p))})`,
        boxSizing: "border-box",
      }}
    >
      {mark ? <NewlMark size={64} /> : <IconTile icon={icon} accent={color} solid size={64} />}
      <div>
        <div style={{ fontSize: 25, fontWeight: 800, color: C.text, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 18, color: C.textSoft, marginTop: 4, fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  );
  const app = { x: 860, y: 520 };
  const auth = { x: 340, y: 380 };
  const fs = { x: 340, y: 640 };
  const wk = { x: 1440, y: 360 };
  const ms = { x: 1440, y: 560 };
  const ph = { x: 1440, y: 760 };
  const cols = ["users", "projects", "casuals", "daily_logs", "budgets", "notifications", "audit"];
  return (
    <>
      <SceneTitle title={d.title} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Arrow x1={app.x - 180} y1={app.y - 40} x2={auth.x + 175} y2={auth.y + 10} p={visible(1)} accent={accent} frame={frame} />
        <Arrow x1={app.x - 180} y1={app.y + 40} x2={fs.x + 175} y2={fs.y - 10} p={visible(2)} accent={accent} frame={frame + 15} />
        <Arrow x1={app.x + 180} y1={app.y - 30} x2={wk.x - 175} y2={wk.y + 20} p={visible(4)} accent={accent} frame={frame + 7} />
        <Arrow x1={wk.x} y1={wk.y + 72} x2={ms.x} y2={ms.y - 74} p={visible(4)} accent={accent} frame={frame + 20} />
        <Arrow x1={ms.x} y1={ms.y + 72} x2={ph.x} y2={ph.y - 74} p={visible(4)} accent={accent} frame={frame + 30} />
      </svg>
      <Node x={app.x} y={app.y} w={360} icon="window-maximize" title="NEWL AFRICA app" sub="Runs in the web browser" p={visible(0)} mark />
      <Node x={auth.x} y={auth.y} icon="id-card" title="Firebase Authentication" sub="Secure sign-in (Google)" p={visible(1)} color={C.secondary} />
      <Node x={fs.x} y={fs.y} icon="database" title="Firestore" sub="Cloud database (Google)" p={visible(2)} color={C.secondary} />
      <div style={{ position: "absolute", left: 160, top: 760, width: 760, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {cols.map((c, i) => {
          const p = prog(frame, (scene.beats.find((b) => typeof b.show === "number" && b.show >= 4)?.vStart ?? 1e9) + 6 + i * 6, 12);
          return (
            <div
              key={c}
              style={{
                fontSize: 19,
                fontWeight: 700,
                fontFamily: "ui-monospace, Consolas, monospace",
                color: C.secondary,
                background: hexToRgba(C.secondary, 0.08),
                border: `1px solid ${hexToRgba(C.secondary, 0.25)}`,
                padding: "8px 14px",
                borderRadius: 12,
                opacity: p,
                transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <Node x={wk.x} y={wk.y} icon="cloud" title="Cloudflare Worker" sub="SMS relay service" p={visible(4)} color={C.accent} />
      <Node x={ms.x} y={ms.y} icon="tower-broadcast" title="Mobilesasa" sub="SMS gateway" p={visible(4)} color={C.accent} />
      <Node x={ph.x} y={ph.y} icon="mobile-screen" title="Mobile phones" sub="Text message delivered" p={visible(4)} color={C.accent} />
    </>
  );
};

/* -------------------------------------------------------------- checklist */
const Checklist: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const { accent } = useLesson();
  const { visible, focus } = useReveal(scene);
  const d = scene.data;
  const items = d.items as { icon: string; title: string; body: string }[];
  return (
    <>
      <SceneTitle title={d.title} />
      <div style={{ position: "absolute", left: 160, right: 160, top: 268, display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((it, i) => {
          const p = visible(i);
          const f = focus === i;
          const dim = focus !== undefined && !f;
          return (
            <div
              key={i}
              style={{
                ...cardBase(f, false, accent),
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "20px 30px",
                opacity: Math.max(0.12, p) * (dim && p > 0 ? 0.55 : 1),
                transform: `translateX(${(1 - p) * 30}px)`,
              }}
            >
              <svg width={52} height={52} viewBox="0 0 52 52">
                <circle cx={26} cy={26} r={23} fill={p >= 1 ? accent : "none"} stroke={accent} strokeWidth={3} strokeDasharray={145} strokeDashoffset={145 * (1 - p)} />
                <path d="M15 27 L23 34 L37 19" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" opacity={p >= 1 ? 1 : 0} />
              </svg>
              <IconTile icon={it.icon} accent={accent} size={56} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>{it.title}</div>
                <div style={{ fontSize: 21.5, color: C.textSoft, marginTop: 4, fontWeight: 500 }}>{it.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const REGISTRY: Record<string, React.FC<{ scene: TimedScene }>> = {
  cards: Cards,
  tiers: Tiers,
  flow: Flow,
  formula: Formula,
  compare: Compare,
  matrix: Matrix,
  architecture: Architecture,
  checklist: Checklist,
};

export const DiagramScene: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const Comp = REGISTRY[scene.diagram ?? "cards"];
  return <AbsoluteFill style={{ fontFamily: FONT }}>{Comp ? <Comp scene={scene} /> : null}</AbsoluteFill>;
};
