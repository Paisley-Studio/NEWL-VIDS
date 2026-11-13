// Visual tokens taken directly from the NEWL AFRICA application's CSS (:root variables).
export const C = {
  primary: "#1e6b3a",
  primaryLight: "#2a8a4a",
  primaryDark: "#15502a",
  primaryBg: "#e6f4ec",
  secondary: "#1a6dff",
  accent: "#e67e22",
  danger: "#dc3545",
  bg: "#f6faf8",
  surface: "#ffffff",
  border: "#e8f0ec",
  text: "#1a2a24",
  textSoft: "#4d5f57",
  textLight: "#8a9f95",
  ink: "#04100a",
  inkSoft: "#0b2416",
};

export const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Virtual canvas that every screenshot / replica is laid out on (see screenshots.json). */
export const CANVAS = { w: 1920, h: 880 };

/** Browser window that frames the application on screen. */
export const WINDOW = { x: 160, y: 146, w: 1600, bar: 40 };
export const VIEW = { x: WINDOW.x, y: WINDOW.y + WINDOW.bar, w: WINDOW.w, h: Math.round((WINDOW.w * CANVAS.h) / CANVAS.w) };

/** The application renders its UI at ~1.35x in the supplied screenshots. */
export const APP_ZOOM = 1.35;

export const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const mix = (hexA: string, hexB: string, t: number) => {
  const pa = parseInt(hexA.slice(1), 16);
  const pb = parseInt(hexB.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
