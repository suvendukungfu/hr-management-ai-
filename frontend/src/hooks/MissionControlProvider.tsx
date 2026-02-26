import React, { createContext, useContext, type ReactNode } from "react";

import { useMissionControl, type MissionControlApi } from "./useMissionControl.js";

const MissionControlContext = createContext<MissionControlApi | null>(null);

export function MissionControlProvider({ children }: { children: ReactNode }) {
  const missionControl = useMissionControl();
  return (
    <MissionControlContext.Provider value={missionControl}>
      {children}
    </MissionControlContext.Provider>
  );
}

export function useMissionControlContext(): MissionControlApi {
  const context = useContext(MissionControlContext);
  if (!context) {
    throw new Error(
      "useMissionControlContext must be used inside MissionControlProvider"
    );
  }
  return context;
}
