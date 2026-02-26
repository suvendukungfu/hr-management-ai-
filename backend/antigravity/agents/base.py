import asyncio
from typing import Any, Dict, List
from antigravity.events.event_bus import event_bus
from antigravity.state.store import state_store

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        
    async def update_status(self, status: str, action: str = ""):
        state_store.update_agent(self.name, status, action)
        await event_bus.emit(f"agent:{self.name.lower().replace(' ', '_')}", 
                            {"status": status, "action": action, "name": self.name})
                            
    async def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        await self.update_status("RUNNING", f"Starting task: {payload.get('task', 'Unknown')}")
        await event_bus.emit("agent:spawn", self.name)
        
        # Simulate work
        await asyncio.sleep(2)
        
        await self.update_status("WAITING", "Task complete. Awaiting new instructions.")
        return {"status": "success", "agent": self.name}
