import React from "react";
import { cn } from "../../lib/utils.js";

interface ReflectionLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: "insight" | "warning" | "error";
}

interface ReflectionDashboardProps {
  logs: ReflectionLog[];
  className?: string;
}

export function ReflectionDashboard({ logs, className }: ReflectionDashboardProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <h3 className="font-semibold text-lg mb-4">Reflection Dashboard</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {logs.map((log) => (
          <div key={log.id} className={cn(
            "p-4 rounded-md border text-sm flex gap-4 items-start",
            log.type === "error" ? "bg-destructive/5 border-destructive/20 text-destructive" :
            log.type === "warning" ? "bg-waiting/5 border-waiting/20 text-yellow-500" :
            "bg-background/50 border-border text-foreground"
          )}>
            <div className="flex-none pt-0.5">
              {log.type === "error" ? "🚨" : log.type === "warning" ? "⚠️" : "💡"}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs opacity-70 uppercase tracking-wider">{log.source}</span>
                <span className="text-xs opacity-50">{log.timestamp}</span>
              </div>
              <p>{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
