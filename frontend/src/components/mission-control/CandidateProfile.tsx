import React from "react";
import { cn } from "../../lib/utils.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface Profile {
  name: string;
  role: string;
  matchScore: number;
  skills: string[];
  status: string;
}

interface CandidateProfileProps {
  candidate: Profile;
  className?: string;
}

export function CandidateProfile({ candidate, className }: CandidateProfileProps) {
  const isHighMatch = candidate.matchScore >= 80;
  const matchColor = isHighMatch ? theme.colors.running : theme.colors.waiting;
  
  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 22, fontWeight: 700, margin: 0, color: theme.colors.text }}>
            {candidate.name.toUpperCase()}
          </h3>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 11, color: theme.colors.muted }}>
            {candidate.role.toUpperCase()}
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <div style={{ 
            fontFamily: "var(--font-secondary)", fontSize: 24, fontWeight: 700, 
            color: matchColor, textShadow: isHighMatch ? `0 0 10px ${matchColor}80` : "none" 
          }}>
            {candidate.matchScore}%
          </div>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 8, fontWeight: 600, letterSpacing: 1, color: theme.colors.muted }}>
            // MATCH_SCORE
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5, marginBottom: 8 }}>
            // CORE_SKILLS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {candidate.skills.map(skill => (
              <span key={skill} style={{ 
                fontFamily: "var(--font-primary)", fontSize: 10, padding: "4px 8px", 
                background: theme.colors.sidebar, border: `1px solid ${theme.colors.panelBorder}`, color: theme.colors.text 
              }}>
                {skill.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ paddingTop: 16, borderTop: `1px solid ${theme.colors.panelBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5 }}>
            // PIPELINE_STATUS
          </span>
          <span style={{ 
            fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, padding: "4px 10px", 
            background: `${theme.colors.running}15`, border: `1px solid ${theme.colors.running}40`, color: theme.colors.running, letterSpacing: 1 
          }}>
            {candidate.status.toUpperCase()}
          </span>
        </div>
      </div>
    </Card>
  );
}
