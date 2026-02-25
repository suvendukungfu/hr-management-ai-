import asyncio
from .event_bus import event_bus

class ReflectionEngine:
    def __init__(self):
        self.system_memory = {}
        
    async def evaluate_results(self, agent_name: str, task_context: dict, result: dict):
        """
        Evaluates the results from an agent's execution and updates memory.
        """
        await event_bus.publish("reflection:start", {"agent": agent_name, "task": task_context})
        
        # Simple reflection logic
        score = result.get("success_score", 1.0)
        feedback = "Good job." if score >= 0.8 else "Needs improvement."
        
        memory_update = {
            "agent": agent_name,
            "last_score": score,
            "feedback": feedback
        }
        
        self.system_memory[agent_name] = memory_update
        
        await event_bus.publish("reflection:complete", {
            "memory_update": memory_update,
            "system_memory": self.system_memory
        })
        
        return memory_update

reflection_engine = ReflectionEngine()
