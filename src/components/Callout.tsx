import React from "react";
import { C, FONT, hexToRgba, VIEW, WINDOW } from "../theme";
import type { Callout } from "../types";
import { Icon } from "./base";

/** Information card used to state a rule or nuance precisely while the visuals stay on the UI. */
export const CalloutCard: React.FC<{
  callout: Callout;
  accent: string;
  appear: number;
  leave: number;
  area: "stage" | "frame";
}> = ({ callout, accent, appear, leave, area }) => {
  const o = appear * (1 - leave);
  if (o <= 0.001) return null;
  const pos = callout.pos ?? "right";
  const width = pos === "bottom" ? 1100 : 560;
  let style: React.CSSProperties;
  if (pos === "bottom") {
    style = { left: (1920 - width) / 2, top: area === "stage" ? VIEW.y + VIEW.h - 230 : 790 };
  } else if (pos === "left") {
    style = { left: WINDOW.x + 36, top: VIEW.y + VIEW.h / 2 - 110 };
  } else {
    style = { left: WINDOW.x + WINDOW.w - width - 36, top: VIEW.y + VIEW.h / 2 - 110 };
  }
  const dx = pos === "right" ? 40 : pos === "left" ? -40 : 0;
  const dy = pos === "bottom" ? 30 : 0;
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        width,
        fontFamily: FONT,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 24,
        boxShadow: `0 30px 70px rgba(6,22,13,0.25), 0 0 0 1px ${C.border}`,
        padding: "26px 30px 28px 34px",
        display: "flex",
        gap: 22,
        opacity: o,
        transform: `translate(${(1 - appear) * dx}px, ${(1 - appear) * dy}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, background: accent }} />
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: hexToRgba(accent, 0.12),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={callout.icon ?? "circle-info"} size={26} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 27, fontWeight: 800, color: C.text, letterSpacing: "-0.01em", marginBottom: 8 }}>{callout.title}</div>
        <div style={{ fontSize: 22, lineHeight: 1.45, color: C.textSoft, fontWeight: 500 }}>{callout.body}</div>
      </div>
    </div>
  );
};
