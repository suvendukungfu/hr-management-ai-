import React, { useRef, useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface EventTimelineProps {
  className?: string;
}

export function EventTimeline({ className }: EventTimelineProps) {
  const { events } = useAntigravityState();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const timelineMapped = events.length > 0 ? events.map((e: any, idx: number) => {
    const category = e.topic.startsWith('planner') ? 'planner' :
                     e.topic.startsWith('agent') ? 'agent' :
                     e.topic.startsWith('simulation') ? 'simulation' : 'system';

    return {
      id: `ev-${idx}-${e.timestamp || Date.now()}`,
      topic: e.topic.toUpperCase(),
      category,
      data: typeof e.data === 'string' ? e.data : JSON.stringify(e.data),
      timestamp: new Date(e.timestamp || Date.now()).toLocaleTimeString()
    };
  }) : [
    { id: "e1", topic: "SYSTEM:BOOT", category: "system", data: "Mission Control Online", timestamp: "09:00 AM" },
    { id: "e2", topic: "AGENT:SPAWN", category: "agent", data: "Recruiter Agent deployed", timestamp: "09:02 AM" },
    { id: "e3", topic: "PLANNER:ROUTE", category: "planner", data: "Goal updated: Senior Eng", timestamp: "09:05 AM" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timelineMapped.length]);

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0, color: theme.colors.text }}>
          EVENT STREAM LOGS
        </h3>
        <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 1 }}>
          // LIVE_FEED
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        style={{ position: "relative", marginLeft: 8, paddingLeft: 16, borderLeft: `1px dashed ${theme.colors.panelBorder}`, display: "flex", flexDirection: "column", gap: 24, flex: 1, overflowY: "auto", paddingBottom: 24 }}
        className="custom-scrollbar"
      >
        {timelineMapped.map((event: any, i: number) => {
          const dotColor = event.category === 'planner' ? theme.colors.running :
                           event.category === 'agent' ? theme.colors.ready :
                           event.category === 'simulation' ? theme.colors.waiting : theme.colors.muted;
          
          return (
            <div key={event.id} style={{ position: "relative" }} className="animate-fade-in-up">
              <span style={{ 
                position: "absolute", left: -20, top: 4, width: 7, height: 7, 
                background: dotColor, boxShadow: `0 0 8px ${dotColor}80` 
              }} />
              
              <div style={{ 
                background: theme.colors.sidebar, border: `1px solid ${theme.colors.panelBorder}`, padding: 12, display: "flex", flexDirection: "column", gap: 6 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, color: dotColor, letterSpacing: 0.5 }}>
                    [{event.topic}]
                  </span>
                  <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, color: theme.colors.muted }}>
                    {event.timestamp}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-primary)", fontSize: 11, margin: 0, color: theme.colors.text, lineHeight: 1.5, wordWrap: "break-word" }}>
                  {event.data}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
