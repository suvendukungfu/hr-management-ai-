from typing import Dict, Any, List

from pydantic import BaseModel, Field

class AgentState(BaseModel):
    name: str
    status: str = "IDLE"  # RUNNING, WAITING, IDLE, READY
    last_action: str = ""

class SystemState(BaseModel):
    status: str = "IDLE"  # SIMULATING, ACTIVE, IDLE
    simulation_progress: int = 0
    confidence_index: int = 100
    agents: Dict[str, AgentState] = Field(default_factory=dict)
    current_goal: str = ""
    reflection_logs: List[Dict[str, str]] = Field(default_factory=list)

class StateStore:
    def __init__(self):
        self._state = SystemState()
        
    def init_agents(self, agent_names: List[str]):
        for name in agent_names:
            self._state.agents[name] = AgentState(name=name)
            
    def update_agent(self, name: str, status: str, action: str = ""):
        if name in self._state.agents:
            self._state.agents[name].status = status
            if action:
                self._state.agents[name].last_action = action
                
    def set_system_status(self, status: str):
        self._state.status = status

    def set_current_goal(self, goal: str):
        self._state.current_goal = goal

    def set_simulation_progress(self, progress: int):
        self._state.simulation_progress = max(0, min(100, int(progress)))

    def set_confidence_index(self, confidence: int):
        self._state.confidence_index = max(0, min(100, int(confidence)))

    def append_reflection_log(self, log: Dict[str, str]):
        self._state.reflection_logs.append(log)
        self._state.reflection_logs = self._state.reflection_logs[-100:]
        
    def get_state_snapshot(self) -> Dict[str, Any]:
        return self._state.model_dump()

state_store = StateStore()
