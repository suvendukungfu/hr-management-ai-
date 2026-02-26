import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from antigravity.events.event_bus import event_bus
from antigravity.state.store import state_store
from antigravity.orchestrator.autonomous import orchestrator
from antigravity.agents.fleet import fleet

router = APIRouter()

class GoalRequest(BaseModel):
    goal: str

@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await event_bus.connect_websocket(websocket)
    try:
        while True:
            # Maintain active connection
            await websocket.receive_text()
    except WebSocketDisconnect:
        event_bus.disconnect_websocket(websocket)

@router.post("/planner/start")
async def start_mission(req: GoalRequest):
    orchestrator.add_goal(req.goal)
    return {"status": "Mission registered", "goal": req.goal}

@router.post("/planner/stop")
async def stop_mission():
    await orchestrator.stop()
    return {"status": "Stop command registered"}

@router.post("/simulation/run")
async def run_simulation(req: GoalRequest):
    # For UI testing purposes, we simply push it through the orchestrator.
    # The frontend maps "SIMULATING" state specifically to show the engine graphics.
    orchestrator.add_goal(req.goal)
    return {"status": "Simulation queued"}
    
@router.post("/simulation/stop")
async def stop_simulation():
    await orchestrator.stop()
    return {"status": "Simulation halted"}

@router.post("/agent/{agent_name}/trigger")
async def trigger_agent(agent_name: str, req: GoalRequest = GoalRequest(goal="Triggered manually")):
    # Convert parameter formats if needed
    target_agent = "Recruiter Agent" if "recruiter" in agent_name.lower() else agent_name
    agent = fleet.get(target_agent)
    
    if not agent:
        return {"error": "Agent not resolved in fleet"}
        
    asyncio.create_task(agent.execute({"task": req.goal}))
    return {"status": f"Agent {target_agent} executed", "goal": req.goal}

@router.get("/system/state")
def get_system_state():
    return state_store.get_state_snapshot()
