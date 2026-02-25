import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { theme } from "../theme";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const NAV_ICONS: Record<string, string> = {
  Overview: "📊",
  Candidates: "👤",
  Agents: "🤖",
  "Planner Graph": "🔗",
  Simulation: "🧪",
  Reflection: "🧠",
  Analytics: "📈",
  "Live Event Stream": "⚡",
};

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Candidates", path: "/candidate-profile" },
  { label: "Agents", path: "/agent-control" },
  { label: "Planner Graph", path: "/planner-graph" },
  { label: "Simulation", path: "/simulation" },
  { label: "Reflection", path: "/reflection" },
  { label: "Analytics", path: "/analytics" },
  { label: "Live Event Stream", path: "/event-stream" },
];

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
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
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 12px", borderBottom: `1px solid ${theme.colors.panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.colors.running}, ${theme.colors.ready})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: theme.colors.bg,
            }}>
              AI
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>HR Mission Control</div>
              <div style={{ fontSize: "0.7rem", color: theme.colors.muted }}>God-Mode Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <div className="section-label">Navigation</div>
          {navItems.slice(0, 3).map((item) => (
            <NavItem key={item.label} item={item} isActive={location.pathname === item.path} />
          ))}

          <div className="section-label" style={{ marginTop: 8 }}>Intelligence</div>
          {navItems.slice(3, 6).map((item) => (
            <NavItem key={item.label} item={item} isActive={location.pathname === item.path} />
          ))}

          <div className="section-label" style={{ marginTop: 8 }}>Monitoring</div>
          {navItems.slice(6).map((item) => (
            <NavItem key={item.label} item={item} isActive={location.pathname === item.path} />
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${theme.colors.panelBorder}`, fontSize: "0.72rem", color: theme.colors.idle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-dot running" style={{ width: 6, height: 6, marginRight: 4 }} />
            System Online · v2.0
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
      }}>
        {/* Top Bar */}
        <header style={{
          height: theme.layout.navbarHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: theme.colors.muted }}>{subtitle}</p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.82rem", color: theme.colors.muted }}>
            <span className="live-dot running" /> Live
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function NavItem({ item, isActive }: { item: { label: string; path: string }; isActive: boolean }) {
  return (
    <Link to={item.path} className={`nav-link ${isActive ? "active" : ""}`}>
      <span style={{ fontSize: "1.05rem" }}>{NAV_ICONS[item.label] || "•"}</span>
      {item.label}
    </Link>
  );
}

/* ===== Enhanced Card ===== */
interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
  className?: string;
}

export function Card({ children, style = {}, glow, className = "" }: CardProps) {
  return (
    <div
      className={`card-hover ${className}`}
      style={{
        background: theme.colors.panel,
        border: `1px solid ${theme.colors.panelBorder}`,
        borderRadius: theme.layout.cardRadius,
        padding: 20,
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
}

export function MetricCard({ label, value, color, icon }: MetricCardProps) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: theme.colors.muted, fontSize: "0.78rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ color: color || theme.colors.text, fontSize: "1.35rem", fontWeight: 700 }}>
            {value}
          </div>
        </div>
        {icon && <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>{icon}</span>}
      </div>
    </Card>
  );
}
