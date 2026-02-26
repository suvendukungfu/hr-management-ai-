import React from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";

interface EventTimelineProps {
  className?: string;
}

export function EventTimeline({ className }: EventTimelineProps) {
  const { events } = useAntigravityState();
  
  const timelineMapped = events.length > 0 ? events.slice(0, 5).map((e: any, idx: number) => ({
    id: `ev-${idx}-${e.timestamp || Date.now()}`,
    topic: e.topic,
    data: typeof e.data === 'string' ? e.data : JSON.stringify(e.data),
    timestamp: new Date().toLocaleTimeString()
  })) : [
    { id: "e1", topic: "system:boot", data: "Mission Control Online", timestamp: "09:00 AM" },
    { id: "e2", topic: "agent:spawn", data: "Recruiter Agent deployed", timestamp: "09:02 AM" },
    { id: "e3", topic: "planner:route", data: "Goal updated: Senior Eng", timestamp: "09:05 AM" }
  ];

  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <h3 className="font-semibold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
        Live Event Timeline
      </h3>
      <div className="relative border-l border-border ml-3 pl-4 space-y-6">
        {timelineMapped.map((event: any, i: number) => (
          <div key={event.id} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background animate-pulse-glow" />
            <div className="bg-background/50 rounded-md p-3 border border-border hover:bg-background/80 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold text-primary">{event.topic}</span>
                <span className="text-xs text-muted-foreground">{event.timestamp}</span>
              </div>
              <p className="text-sm text-foreground">{event.data}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
