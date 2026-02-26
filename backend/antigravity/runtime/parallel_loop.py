import asyncio
from typing import List, Dict, Any
from antigravity.runtime.event_bus import event_bus
from antigravity.state.store import state_store
from antigravity.agents.fleet import fleet

class ParallelLoop:
    """Dispatches agents asynchronously and waits for all to complete."""
    
    @staticmethod
    async def run_batch(agent_names: List[str], payload: Dict[str, Any]) -> List[Any]:
        # Update simulation progress to show batch starting
        state_store.set_simulation_progress(10)
        await event_bus.emit("simulation:progress", 10)
        
        tasks = []
        for name in agent_names:
            agent = fleet.get(name)
            if agent:
                tasks.append(agent.execute(payload))
                
        # Fire off agents concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        state_store.set_simulation_progress(90)
        await event_bus.emit("simulation:progress", 90)
        return results
