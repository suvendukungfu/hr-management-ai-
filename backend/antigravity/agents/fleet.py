import asyncio
from .base import BaseAgent

class RecruiterAgent(BaseAgent):
    def __init__(self):
        super().__init__("Recruiter Agent", "Sourcing & Outreach")

    async def execute(self, payload: dict) -> dict:
        await super().update_status("RUNNING", "Fetching candidates from LinkedIn API")
        await asyncio.sleep(1.5)
        await super().update_status("RUNNING", "Scoring candidates based on JD")
        await asyncio.sleep(1.5)
        await super().update_status("WAITING", "Candidate batch processed")
        return {"processed": 42}

class SchedulerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Scheduler Agent", "Interview Logistics")

class AnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__("Analytics Agent", "Data Processing")

class BiasDetectionAgent(BaseAgent):
    def __init__(self):
        super().__init__("Bias Detection Agent", "Fairness Monitoring")

# Pre-instantiate the fleet
fleet = {
    "Recruiter Agent": RecruiterAgent(),
    "Scheduler Agent": SchedulerAgent(),
    "Analytics Agent": AnalyticsAgent(),
    "Bias Detection Agent": BiasDetectionAgent()
}
