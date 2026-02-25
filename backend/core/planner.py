import asyncio
from typing import Dict, Any

from .event_bus import event_bus
from .simulation import simulation_engine
from .reflection import reflection_engine

# A basic registry to load agents dynamically
AGENT_REGISTRY = {}

def register_agent(name: str, agent_instance):
    AGENT_REGISTRY[name] = agent_instance

class TaskPlanner:
    def __init__(self):
        pass

    def create_graph(self, goal: str) -> list:
        """
        Translates a high-level goal into a directed execution graph (simple list for now).
        """
        print(f"Planning graph for goal: {goal}")
        # Return a mock graph depending on keywords
        graph = []
        if "hire" in goal.lower() or "recruit" in goal.lower():
            graph = ["RecruiterAgent", "BiasDetectionAgent", "SchedulerAgent"]
        elif "analyze" in goal.lower():
            graph = ["AnalyticsAgent"]
        else:
            graph = ["AnalyticsAgent", "SchedulerAgent"]
            
        return graph

class ManagerPlanner:
    def __init__(self):
        self.task_planner = TaskPlanner()
        self.running = False
        self.current_goal = None
        self.current_graph = None

    async def start_mission(self, goal: str):
        self.running = True
        self.current_goal = goal
        
        await event_bus.publish("planner:start", {"goal": goal})
        
        # 1. Create Execution Graph
        self.current_graph = self.task_planner.create_graph(goal)
        await event_bus.publish("planner:graph_created", {"graph": self.current_graph})
        
        # 2. Run Simulation
        simulation_result = await simulation_engine.run_simulation(self.current_graph)
        if not simulation_result.get("status") == "success":
            await event_bus.publish("planner:error", {"error": "Simulation failed."})
            return

        # 3. Execution Phase
        await event_bus.publish("planner:execution_start", {"graph": self.current_graph})
        
        for agent_name in self.current_graph:
            if not self.running:
                await event_bus.publish("planner:stopped", {"message": "Planner stopped manually"})
                break
                
            agent_instance = AGENT_REGISTRY.get(agent_name)
            if not agent_instance:
                await event_bus.publish("planner:error", {"error": f"Agent {agent_name} not found."})
                continue
                
            # Execute Agent
            result = await agent_instance.execute({"goal": goal})
            
            # 4. Reflection Phase
            await reflection_engine.evaluate_results(agent_name, {"goal": goal}, result)
            
        self.running = False
        await event_bus.publish("planner:complete", {"goal": goal})

    async def stop_mission(self):
        self.running = False
        simulation_engine.running = False
        await event_bus.publish("planner:stop", {"message": "Mission stopping..."})

# Singleton
manager_planner = ManagerPlanner()
