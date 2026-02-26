import asyncio
from typing import Dict, Any, List
from antigravity.events.event_bus import event_bus
from antigravity.state.store import state_store

class SelfEvolvingPlanner:
    """Manages the graph topology and execution order of agents."""
    
    def __init__(self):
        self.graph = [
            {"id": "source", "label": "Candidate Sourcing", "status": "pending"},
            {"id": "enrich", "label": "Profile Enrichment", "status": "pending"},
            {"id": "evaluate", "label": "Skill Evaluation", "status": "pending"},
            {"id": "schedule", "label": "Interview Coordination", "status": "pending"}
        ]
        
    async def build_plan(self, goal: str):
        state_store.set_system_status("PLANNING")
        await event_bus.emit("planner:route", f"Evaluating new goal: {goal}")
        
        # Reset graph
        for node in self.graph:
            node["status"] = "pending"
            
        await event_bus.emit("planner:graph_update", self.graph)
        
    async def update_node(self, node_id: str, status: str):
        for node in self.graph:
            if node["id"] == node_id:
                node["status"] = status
                break
        await event_bus.emit("planner:graph_update", self.graph)

planner_engine = SelfEvolvingPlanner()
