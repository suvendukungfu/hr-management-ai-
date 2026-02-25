import asyncio
from .base import WorkerAgent
from core.planner import register_agent

class RecruiterAgent(WorkerAgent):
    name = "RecruiterAgent"
    
    async def execute(self, task_context: dict):
        await self.update_state("RUNNING", {"task": "Sourcing Candidates"})
        await asyncio.sleep(1.5) # Simulate work
        
        found_candidates = ["Alice", "Bob"]
        await self.update_state("COMPLETED", {"candidates": found_candidates})
        return {"success_score": 0.9, "candidates": found_candidates}

class BiasDetectionAgent(WorkerAgent):
    name = "BiasDetectionAgent"
    
    async def execute(self, task_context: dict):
        await self.update_state("RUNNING", {"task": "Analyzing descriptions for bias"})
        await asyncio.sleep(1.0)
        
        await self.update_state("COMPLETED", {"bias_score": 0.05, "verdict": "Clear"})
        return {"success_score": 0.95, "bias_score": 0.05}

class SchedulerAgent(WorkerAgent):
    name = "SchedulerAgent"
    
    async def execute(self, task_context: dict):
        await self.update_state("RUNNING", {"task": "Booking interviews"})
        await asyncio.sleep(1.5)
        
        await self.update_state("COMPLETED", {"schedule": "Completed 3 bookings"})
        return {"success_score": 1.0, "bookings": 3}

class AnalyticsAgent(WorkerAgent):
    name = "AnalyticsAgent"
    
    async def execute(self, task_context: dict):
        await self.update_state("RUNNING", {"task": "Gathering HR metrics"})
        await asyncio.sleep(2.0)
        
        await self.update_state("COMPLETED", {"report": "Metrics gathered."})
        return {"success_score": 0.85, "metrics": {"turnover": "5%", "satisfaction": "High"}}

# Register agents for dynamic access later
register_agent("RecruiterAgent", RecruiterAgent())
register_agent("BiasDetectionAgent", BiasDetectionAgent())
register_agent("SchedulerAgent", SchedulerAgent())
register_agent("AnalyticsAgent", AnalyticsAgent())
