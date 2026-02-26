import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.endpoints import router as antigravity_router
from antigravity.orchestrator.autonomous import orchestrator

logger = logging.getLogger("antigravity.runtime")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Boot/shutdown hooks for the research runtime.
    This keeps orchestration + supervisor lifecycle explicit and observable.
    """
    logger.info("research.runtime.start")
    await orchestrator.start()
    try:
        yield
    finally:
        await orchestrator.stop()
        logger.info("research.runtime.stop")


app = FastAPI(title="HR AI Mission Control (Antigravity)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the new Antigravity autonomous endpoints
app.include_router(antigravity_router)


@app.get("/research/metrics")
def get_research_metrics():
    return orchestrator.get_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
