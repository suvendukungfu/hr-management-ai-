import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.event_bus import event_bus
from core.planner import manager_planner, AGENT_REGISTRY
from core.simulation import simulation_engine
from core.reflection import reflection_engine

# Make sure agents are imported to register them
import agents.worker_agents

app = FastAPI(title="HR AI Mission Control")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Let frontend connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoalRequest(BaseModel):
    goal: str

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await event_bus.connect_websocket(websocket)
    try:
        while True:
            # We just need to keep the connection open for the event bus to send data
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        event_bus.disconnect_websocket(websocket)

@app.post("/planner/start")
async def planner_start(req: GoalRequest):
    # Run in background to not block HTTP response
    asyncio.create_task(manager_planner.start_mission(req.goal))
    return {"status": "Mission started", "goal": req.goal}

@app.post("/planner/stop")
async def planner_stop():
    await manager_planner.stop_mission()
    return {"status": "Mission stopping"}

@app.post("/simulation/run")
async def run_simulation(req: GoalRequest):
    graph = manager_planner.task_planner.create_graph(req.goal)
    result = await simulation_engine.run_simulation(graph)
    return result

@app.post("/agent/{agent_name}/trigger")
async def trigger_agent(agent_name: str, req: GoalRequest):
    agent_instance = AGENT_REGISTRY.get(agent_name)
    if not agent_instance:
        return {"error": "Agent not found"}
        
    # Run in background
    asyncio.create_task(agent_instance.execute({"goal": req.goal}))
    return {"status": f"Agent {agent_name} triggered", "goal": req.goal}

@app.get("/system/state")
def get_system_state():
    return {
        "planner_running": manager_planner.running,
        "current_goal": manager_planner.current_goal,
        "system_memory": reflection_engine.system_memory,
        "agents": {name: agent.state for name, agent in AGENT_REGISTRY.items()}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
