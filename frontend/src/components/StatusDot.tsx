import React from "react";
import { statusColor } from "../theme";

interface StatusDotProps {
  state: string;
  size?: number;
}

export function StatusDot({ state, size = 8 }: StatusDotProps) {
  const color = statusColor(state);
  const isActive = state === "RUNNING" || state === "ACTIVE";

  return (
    <span
      className={`live-dot ${state.toLowerCase()}`}
      style={{
        width: size,
        height: size,
        background: color,
        color: color,
        animation: isActive ? undefined : "none",
      }}
    />
  );
}
