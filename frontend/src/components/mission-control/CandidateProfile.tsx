import React from "react";
import { cn } from "../../lib/utils.js";

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
  
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground animate-shimmer">
            {candidate.name}
          </h3>
          <p className="text-muted-foreground">{candidate.role}</p>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-2xl font-bold font-mono inline-block animate-pulse-glow",
            isHighMatch ? "text-primary" : "text-waiting"
          )}>
            {candidate.matchScore}%
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Match Score</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2 opacity-80">Core Skills</p>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map(skill => (
              <span key={skill} className="px-2.5 py-1 rounded-md text-xs bg-background border border-border">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pipeline Status</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
              {candidate.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
