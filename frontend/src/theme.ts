export const theme = {
  layout: {
    sidebarWidth: 260,
    navbarHeight: 64,
    outerMargin: 28,
    gridGap: 16,
    cardRadius: 14,
  },
  colors: {
    bg: "#070B14",
    panel: "#0F172B",
    panelBorder: "#1E2D4A",
    panelHover: "#162240",
    sidebar: "#0A0F1C",
    sidebarHover: "#141C30",
    text: "#EAF2FF",
    muted: "#7B93B8",
    running: "#6FF3A3",
    waiting: "#FFD06B",
    idle: "#6B7A94",
    ready: "#7FD7FF",
    danger: "#FF6B8A",
    accent: "#A78BFA",
  },
  shadow: "0 4px 24px rgba(0,0,0,0.25)",
  shadowGlow: "0 0 20px rgba(111, 243, 163, 0.08)",
} as const;

export type StatusType = "RUNNING" | "WAITING" | "IDLE" | "READY" | "ACTIVE" | "COMPLETED" | "STANDBY" | "ENABLED";

export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    RUNNING: theme.colors.running,
    ACTIVE: theme.colors.running,
    COMPLETED: theme.colors.running,
    ENABLED: theme.colors.running,
    WAITING: theme.colors.waiting,
    IDLE: theme.colors.idle,
    STANDBY: theme.colors.idle,
    READY: theme.colors.ready,
  };
  return map[status] || theme.colors.muted;
};
