import * as fas from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";
import { C, FONT } from "../theme";

/* ------------------------------------------------------------------ fonts */
let fontsRequested = false;
/** Loads the Inter font (the application's own typeface) before any frame is captured. */
export const ensureFonts = () => {
  if (fontsRequested || typeof document === "undefined") return;
  fontsRequested = true;
  const handle = delayRender("Loading Inter");
  Promise.all(
    [400, 500, 600, 700, 800].map((w) =>
      new FontFace("Inter", `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2')`, {
        weight: String(w),
      })
        .load()
        .then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};

/* ------------------------------------------------------------------ icons */
type FaDef = { iconName: string; icon: [number, number, unknown, unknown, string | string[]] };
const ICONS: Record<string, FaDef> = {};
for (const v of Object.values(fas) as unknown[]) {
  const d = v as FaDef;
  if (d && typeof d === "object" && "iconName" in d && Array.isArray(d.icon)) ICONS[d.iconName] = d;
}
const ALIASES: Record<string, string> = {
  home: "house",
  search: "magnifying-glass",
  edit: "pen-to-square",
  "sign-out": "right-from-bracket",
  sms: "comment-sms",
  history: "clock-rotate-left",
  cog: "gear",
};

export const Icon: React.FC<{ name: string; size?: number; color?: string; style?: React.CSSProperties }> = ({
  name,
  size = 20,
  color = "currentColor",
  style,
}) => {
  const def = ICONS[ALIASES[name] ?? name];
  if (!def) return <span style={{ display: "inline-block", width: size, height: size }} />;
  const [w, h, , , path] = def.icon;
  const d = Array.isArray(path) ? path.join(" ") : path;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} height={size} width={(size * w) / h} style={{ display: "block", flexShrink: 0, ...style }}>
      <path d={d} fill={color} />
    </svg>
  );
};

/** NEWL AFRICA mark exactly as the application draws it: tower-cell icon on a green rounded square. */
export const NewlMark: React.FC<{ size: number; glow?: number; bg?: string }> = ({ size, glow = 0, bg = C.primary }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: glow ? `0 0 ${glow}px rgba(42,138,74,0.55), 0 ${size * 0.12}px ${size * 0.4}px rgba(0,0,0,0.25)` : undefined,
      flexShrink: 0,
    }}
  >
    <Icon name="tower-cell" size={size * 0.5} color="#fff" />
  </div>
);

/* ---------------------------------------------------------------- easing */
export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOutBack = Easing.bezier(0.34, 1.4, 0.64, 1);

/** 0→1 progress of an animation that starts at `from` and lasts `len` frames. */
export const prog = (frame: number, from: number, len: number, easing = ease) =>
  interpolate(frame, [from, from + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

export const fadeUp = (p: number, dist = 26): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

export const baseText: React.CSSProperties = { fontFamily: FONT, color: C.text, WebkitFontSmoothing: "antialiased" };

export const formatKES = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
