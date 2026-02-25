import asyncio
from core.event_bus import event_bus

class WorkerAgent:
    name = "BaseAgent"
    
    def __init__(self):
        self.state = "IDLE"
        self.memory = []
        
    async def update_state(self, new_state: str, details: dict = None):
        self.state = new_state
        await event_bus.publish("agent:status_update", {
            "agent": self.name,
            "status": self.state,
            "details": details or {}
        })

    async def execute(self, task_context: dict) -> dict:
        """
        Base execution method. Should be overridden by subclasses.
        Returns the result of the agent's work.
        """
        await self.update_state("RUNNING", {"task": task_context})
        
        # Simulate work
        await asyncio.sleep(2)
        
        result = {"success_score": 1.0, "message": "Task completed successfully"}
        
        await self.update_state("COMPLETED", {"result": result})
        return result
