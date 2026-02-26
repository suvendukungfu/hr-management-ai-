export const theme = {
  layout: {
    sidebarWidth: 240,
    navbarHeight: 0, 
    outerMargin: "32px 40px",
    gridGap: 16,
    cardRadius: 0,
  },
  colors: {
    bg: "#0C0C0C",
    panel: "#0A0A0A",
    panelBorder: "#2f2f2f",
    panelHover: "#111111",
    sidebar: "#080808",
    sidebarHover: "#00FF8810",
    text: "#FFFFFF",
    muted: "#6a6a6a",
    running: "#00FF88",
    waiting: "#FF8800",
    idle: "#6a6a6a",
    ready: "#00FF88",
    danger: "#FF4444",
    accent: "#00FF88",
  },
  shadow: "none",
  shadowGlow: "0 0 20px rgba(0, 255, 136, 0.15)",
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
