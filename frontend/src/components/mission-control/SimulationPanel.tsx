import React, { useState } from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";

interface SimulationPanelProps {
  className?: string;
}

export function SimulationPanel({ className }: SimulationPanelProps) {
  const { triggerApi, simResults } = useAntigravityState();
  const [isRunning, setIsRunning] = useState(false);

  const metrics = simResults ? [
    { id: "m1", name: "Candidates", value: simResults.total_processed || "0", unit: "total" },
    { id: "m2", name: "Match Rate", value: simResults.avg_match_rate || "0", unit: "%" },
    { id: "m3", name: "Time to Hire", value: "12", unit: "days" },
    { id: "m4", name: "Bias Alert", value: simResults.bias_incidents || "0", unit: "incidents" },
  ] : [
    { id: "m1", name: "Candidates", value: "1,204", unit: "total" },
    { id: "m2", name: "Match Rate", value: "94.2", unit: "%" },
    { id: "m3", name: "Time to Hire", value: "12", unit: "days" },
    { id: "m4", name: "Bias Alert", value: "0", unit: "incidents" },
  ];

  const handleToggle = () => {
    setIsRunning(!isRunning);
    triggerApi('/simulation/run');
  };

  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Simulation Engine</h3>
        <button 
          onClick={handleToggle}
          className={cn(
            "btn",
            isRunning ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isRunning ? "■ Halt Simulation" : "▶ Start Simulation"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="p-4 rounded-md border border-border bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">{m.name}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-semibold text-foreground">{m.value}</p>
              <span className="text-sm text-muted-foreground">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
      
      {isRunning && (
        <div className="mt-6 p-4 rounded-md bg-info/10 border border-info/20 animate-fade-in-up">
          <p className="text-sm text-info font-medium flex items-center gap-2">
            <span className="live-dot running" /> Simulation parameters are active and tracking live.
          </p>
        </div>
      )}
    </div>
  );
}
