import React, { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { theme } from "../theme.js";
import { cn } from "../lib/utils.js";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

const NAV_ICONS: Record<string, string> = {
  Overview: "📊",
  Analytics: "📈",
  Customers: "👥",
  Products: "📦",
  Reports: "📄",
  Settings: "⚙️",
  "Agent Control": "🤖",
  "Planner Graph": "🔗",
  Simulation: "🧪",
  Reflection: "🧠",
  "Event Stream": "⚡",
};

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Agent Control", path: "/agent-control" },
  { label: "Planner Graph", path: "/planner-graph" },
  { label: "Simulation", path: "/simulation" },
  { label: "Reflection", path: "/reflection" },
  { label: "Event Stream", path: "/event-stream" },
  { label: "Analytics", path: "/analytics" },
];

export function AppLayout({ title, subtitle, children, actions }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.colors.bg, color: theme.colors.text }}>
      {/* ===== Sidebar ===== */}
      <aside style={{
        width: theme.layout.sidebarWidth,
        background: theme.colors.sidebar,
        borderRight: `1px solid ${theme.colors.panelBorder}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        padding: "24px 0",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
            <div style={{
              width: 32, height: 32, background: theme.colors.running,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-primary)", fontWeight: 700, fontSize: 16, color: theme.colors.bg }}>A</span>
            </div>
            <div style={{ fontFamily: "var(--font-primary)", fontWeight: 600, fontSize: 13, letterSpacing: 1, color: theme.colors.text }}>
              ACME
            </div>
          </div>

          {/* System Info Box */}
          <div style={{ padding: "0 20px" }}>
            <div style={{
              background: theme.colors.panel,
              border: `1px solid ${theme.colors.panelBorder}`,
              borderLeft: "none",
              padding: 20,
              display: "flex", flexDirection: "column", gap: 8
            }}>
              <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 500, color: theme.colors.running, letterSpacing: 1, marginBottom: 4 }}>
                // SYSTEM STATUS
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, color: theme.colors.muted }}>UPTIME:</span>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: theme.colors.running }}>99.97%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, color: theme.colors.muted }}>LATENCY:</span>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: theme.colors.text }}>12ms</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, color: theme.colors.muted }}>VERSION:</span>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: theme.colors.text }}>v3.2.1</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map((item) => (
              <NavItem key={item.label} item={item} isActive={location.pathname === item.path || location.pathname.startsWith(item.path)} />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upgrade Box */}
          <div style={{ padding: "0 20px" }}>
            <div style={{
              border: `1px solid ${theme.colors.running}40`,
              padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: theme.colors.running, fontSize: 14 }}>⚡</span>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 11, fontWeight: 600, color: theme.colors.running }}>UPGRADE_PRO</span>
              </div>
              <div style={{ fontFamily: "var(--font-primary)", fontSize: 10, lineHeight: 1.5, color: theme.colors.muted }}>
                Unlock advanced modules and system controls.
              </div>
              <button style={{
                background: theme.colors.running, color: theme.colors.bg,
                fontFamily: "var(--font-primary)", fontSize: 11, fontWeight: 700,
                border: "none", padding: "10px 0", cursor: "pointer", width: "100%"
              }}>
                ACTIVATE
              </button>
            </div>
          </div>

          {/* User Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0 20px", borderTop: `1px solid ${theme.colors.panelBorder}` }}>
            <div style={{
              width: 36, height: 36, background: "#1A1A1A", border: "1px solid #3f3f3f",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: theme.colors.running
            }}>
              MR
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontFamily: "var(--font-primary)", fontSize: 11, fontWeight: 600, color: theme.colors.text }}>M.REYNOLDS</div>
              <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 500, color: theme.colors.muted }}>ADMIN::L3</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main style={{
        flex: 1,
        marginLeft: theme.layout.sidebarWidth,
        padding: theme.layout.outerMargin,
        overflowY: "auto",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}>
        {/* Top Header Layer */}
        <header style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Breadcrumb + Search */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 500, color: theme.colors.muted }}>
              <span>SYS</span> <span style={{ color: "#2A2A2A" }}>&gt;</span>
              <span>DASH</span> <span style={{ color: "#2A2A2A" }}>&gt;</span>
              <span style={{ color: theme.colors.running, fontWeight: 600 }}>OVERVIEW</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: theme.colors.panel, border: `1px solid ${theme.colors.panelBorder}`, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10, width: 200, color: theme.colors.muted
              }}>
                <span style={{ fontSize: 14 }}>🔍</span>
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 500 }}>SEARCH...</span>
              </div>
            </div>
          </div>

          {/* Title Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 500, color: theme.colors.running }}>
                // MODULE_01
              </div>
              <h1 style={{ fontFamily: "var(--font-secondary)", fontSize: 48, fontWeight: 700, margin: 0, letterSpacing: -1, lineHeight: 1 }}>
                {title.toUpperCase()}
              </h1>
              {subtitle && (
                <div style={{ fontFamily: "var(--font-primary)", fontSize: 12, color: theme.colors.muted }}>
                  {subtitle}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {actions || (
                <>
                  <button style={{
                    background: theme.colors.panel, border: `1px solid ${theme.colors.panelBorder}`, color: theme.colors.text,
                    fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                  }}>
                    <span>⬇</span> EXPORT
                  </button>
                  <button style={{
                    background: theme.colors.running, border: "none", color: theme.colors.bg,
                    fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                  }}>
                    <span>+</span> NEW REPORT
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function NavItem({ item, isActive }: { item: { label: string; path: string }; isActive: boolean }) {
  return (
    <Link to={item.path} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        background: isActive ? `${theme.colors.running}10` : "transparent",
        borderLeft: isActive ? `2px solid ${theme.colors.running}` : "2px solid transparent",
        color: isActive ? theme.colors.text : theme.colors.muted,
      }}>
        <span style={{ fontSize: 16, filter: isActive ? `drop-shadow(0 0 4px ${theme.colors.running})` : "none", opacity: isActive ? 1 : 0.7 }}>
          {NAV_ICONS[item.label] || "•"}
        </span>
        <span style={{
          fontFamily: "var(--font-primary)", fontSize: 11, fontWeight: isActive ? 600 : 500,
          letterSpacing: 0.5, color: isActive ? theme.colors.text : theme.colors.muted
        }}>
          {item.label.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

/* ===== Enhanced Card ===== */
interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
  className?: string;
  padding?: string | number;
}

export function Card({ children, style = {}, glow, className = "", padding = 24 }: CardProps) {
  return (
    <div
      className={cn("card-hover", className)}
      style={{
        background: theme.colors.panel,
        border: `1px solid ${theme.colors.panelBorder}`,
        borderRadius: theme.layout.cardRadius,
        padding,
        boxShadow: glow ? `${theme.shadow}, ${theme.shadowGlow}` : theme.shadow,
        transition: "all 0.25s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ===== Metric Card ===== */
interface MetricCardProps {
  label: string;
  value: string;
  color?: string;
  icon?: string;
  trend?: string;
  statusLabel?: string;
}

export function MetricCard({ label, value, color, icon, trend, statusLabel = "LIVE" }: MetricCardProps) {
  return (
    <Card padding={20} className="flex flex-col gap-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, letterSpacing: 0.5, color: theme.colors.muted }}>
          {label.toUpperCase().replace(" ", "_")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: 6, background: color || theme.colors.running,
            boxShadow: `0 0 10px ${color || theme.colors.running}66`
          }} />
          <span style={{ fontFamily: "var(--font-primary)", fontSize: 8, fontWeight: 700, color: color || theme.colors.running }}>
            {statusLabel}
          </span>
        </div>
      </div>
      
      <div style={{ fontFamily: "var(--font-secondary)", fontSize: 32, fontWeight: 700, letterSpacing: -1, color: theme.colors.text }}>
        {value}
      </div>
      
      {(trend || icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: color || theme.colors.running }}>
          {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
          {trend && (
            <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600 }}>{trend}</span>
          )}
        </div>
      )}
    </Card>
  );
}

