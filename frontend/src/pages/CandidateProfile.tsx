import React from "react";
import { AppLayout, Card } from "../components/Layout.js";
import { theme } from "../theme.js";

export default function CandidateProfile() {
  const skills = ["Python", "PyTorch", "LLMs", "React", "System Architecture", "TensorFlow", "MLOps", "Kubernetes"];

  return (
    <AppLayout title="AI Candidate Profile" subtitle="AI-evaluated candidate assessment and planner decision">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Resume Area ===== */}
        <div className="animate-in animate-in-delay-1" style={{ gridColumn: "span 8" }}>
          <Card style={{ minHeight: "70vh" }}>
            <div style={{ borderBottom: `1px solid ${theme.colors.panelBorder}`, paddingBottom: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Alex Mercer</h2>
                  <div style={{ color: theme.colors.ready, fontWeight: 600, fontSize: "1rem" }}>Senior Machine Learning Engineer</div>
                </div>
                <div style={{
                  background: `${theme.colors.running}15`,
                  border: `1px solid ${theme.colors.running}40`,
                  color: theme.colors.running,
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}>
                  AI Score: 89
                </div>
              </div>
            </div>

            <div style={{ background: theme.colors.bg, borderRadius: 10, padding: 28, border: `1px solid ${theme.colors.panelBorder}` }}>
              <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Resume Preview</h3>
              <div style={{ color: theme.colors.text, lineHeight: 1.7, fontSize: "0.92rem" }}>
                <p style={{ marginBottom: 20 }}>
                  <strong style={{ color: theme.colors.ready }}>Experience</strong>
                </p>
                <p style={{ marginBottom: 4 }}>
                  <strong>Lead AI Developer</strong> @ TechNova Inc. <span style={{ color: theme.colors.muted }}>(2022 – Present)</span>
                </p>
                <ul style={{ paddingLeft: 20, color: theme.colors.muted, marginBottom: 20 }}>
                  <li style={{ marginBottom: 4 }}>Spearheaded autonomous agent architecture processing scalable NLP frameworks</li>
                  <li style={{ marginBottom: 4 }}>Improved ML model response latency by 45% using efficient clustering methods</li>
                  <li>Led team of 8 engineers in building real-time recommendation systems</li>
                </ul>
                <p style={{ marginBottom: 20 }}>
                  <strong style={{ color: theme.colors.ready }}>Education</strong>
                </p>
                <p>M.S. Computer Science — <strong>Stanford University</strong></p>
                <p style={{ color: theme.colors.muted }}>B.S. Mathematics — <strong>MIT</strong></p>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Sidebar Insights ===== */}
        <div className="animate-in animate-in-delay-2" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: theme.layout.gridGap }}>

          <Card>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Planner Insights
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InsightRow label="AI Score" value="89" color={theme.colors.running} />
              <InsightRow label="Skill Match" value="High" color={theme.colors.text} />
              <InsightRow label="Bias Risk" value="Minimal" color={theme.colors.running} />

              <div style={{
                background: `${theme.colors.ready}10`,
                border: `1px solid ${theme.colors.ready}30`,
                padding: "14px 16px",
                borderRadius: 10,
                marginTop: 4,
              }}>
                <div style={{ fontSize: "0.75rem", color: theme.colors.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Planner Decision</div>
                <div style={{ fontSize: "1.1rem", color: theme.colors.ready, fontWeight: 800 }}>⚡ Strong Hire</div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Skill Tags
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((skill) => (
                <span key={skill} style={{
                  background: theme.colors.panelBorder,
                  color: theme.colors.text,
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}

function InsightRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.85rem", color: theme.colors.muted }}>{label}</span>
      <span style={{ fontSize: "1rem", fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
