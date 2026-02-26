from __future__ import annotations

import asyncio
import time
from dataclasses import asdict, dataclass, field
from typing import Any, Awaitable, Callable, Dict

from antigravity.runtime.event_bus import event_bus

AgentCoroutineFactory = Callable[[], Awaitable[Any]]


@dataclass
class AgentRuntime:
    role: str
    agent_name: str
    status: str = "IDLE"
    last_heartbeat: float = field(default_factory=time.time)
    restart_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["last_heartbeat"] = int(self.last_heartbeat * 1000)
        return payload


class AgentSupervisor:
    """
    Hierarchical multi-agent supervisor with concurrency limits and restart hooks.
    """

    def __init__(
        self,
        *,
        max_concurrency: int = 3,
        stall_timeout_seconds: float = 30.0,
        max_restarts: int = 1,
    ):
        self._semaphore = asyncio.Semaphore(max_concurrency)
        self._stall_timeout_seconds = stall_timeout_seconds
        self._max_restarts = max_restarts
        self._runtimes: dict[str, AgentRuntime] = {}
        self._active_tasks: dict[str, asyncio.Task[Any]] = {}
        self._monitor_task: asyncio.Task[None] | None = None
        self._running = False

        self.register_role("planner_agent", "Planner Agent")
        self.register_role("executor_agent", "Executor Agent")
        self.register_role("reflection_agent", "Reflection Agent")
        self.register_role("evaluator_agent", "Evaluator Agent")

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._monitor_task = asyncio.create_task(self._monitor_health())

    async def stop(self) -> None:
        self._running = False
        if self._monitor_task and not self._monitor_task.done():
            self._monitor_task.cancel()
            await asyncio.gather(self._monitor_task, return_exceptions=True)
        self._monitor_task = None

    def register_role(self, role: str, agent_name: str) -> None:
        self._runtimes[role] = AgentRuntime(role=role, agent_name=agent_name)

    def heartbeat(self, role: str) -> None:
        runtime = self._runtimes.get(role)
        if runtime:
            runtime.last_heartbeat = time.time()

    async def run(
        self,
        role: str,
        work: AgentCoroutineFactory,
        *,
        timeout_seconds: float = 30.0,
        trace_id: str | None = None,
        _attempt: int = 0,
    ) -> Any:
        if role not in self._runtimes:
            self.register_role(role, role.replace("_", " ").title())
        runtime = self._runtimes[role]

        async with self._semaphore:
            runtime.status = "RUNNING"
            runtime.last_heartbeat = time.time()
            await event_bus.emit(
                "agent:lifecycle",
                {"role": role, "agent_name": runtime.agent_name, "status": runtime.status},
                source="agent_supervisor",
                trace_id=trace_id,
                phase="EXECUTE",
            )

            task = asyncio.create_task(work())
            self._active_tasks[role] = task
            try:
                result = await asyncio.wait_for(task, timeout=timeout_seconds)
                runtime.status = "IDLE"
                runtime.last_heartbeat = time.time()
                await event_bus.emit(
                    "agent:lifecycle",
                    {"role": role, "agent_name": runtime.agent_name, "status": "COMPLETED"},
                    source="agent_supervisor",
                    trace_id=trace_id,
                    phase="EXECUTE",
                )
                return result
            except asyncio.TimeoutError:
                runtime.status = "STALLED"
                runtime.restart_count += 1
                await event_bus.emit(
                    "agent:lifecycle",
                    {
                        "role": role,
                        "agent_name": runtime.agent_name,
                        "status": "STALLED",
                        "restart_count": runtime.restart_count,
                    },
                    source="agent_supervisor",
                    trace_id=trace_id,
                    phase="EXECUTE",
                )
                if runtime.restart_count <= self._max_restarts and _attempt < self._max_restarts:
                    await event_bus.emit(
                        "agent:lifecycle",
                        {
                            "role": role,
                            "agent_name": runtime.agent_name,
                            "status": "RESTARTING",
                            "attempt": _attempt + 1,
                        },
                        source="agent_supervisor",
                        trace_id=trace_id,
                        phase="ADAPT",
                    )
                    return await self.run(
                        role,
                        work,
                        timeout_seconds=timeout_seconds,
                        trace_id=trace_id,
                        _attempt=_attempt + 1,
                    )
                raise
            finally:
                self._active_tasks.pop(role, None)

    def snapshot(self) -> dict[str, Any]:
        return {
            "concurrency_limit": self._semaphore._value if hasattr(self._semaphore, "_value") else None,
            "active_roles": list(self._active_tasks.keys()),
            "runtimes": {role: rt.to_dict() for role, rt in self._runtimes.items()},
        }

    async def _monitor_health(self) -> None:
        while self._running:
            now = time.time()
            for role, runtime in self._runtimes.items():
                if runtime.status != "RUNNING":
                    continue
                elapsed = now - runtime.last_heartbeat
                if elapsed < self._stall_timeout_seconds:
                    continue
                await event_bus.emit(
                    "agent:lifecycle",
                    {
                        "role": role,
                        "agent_name": runtime.agent_name,
                        "status": "HEALTH_ALERT",
                        "elapsed_seconds": round(elapsed, 2),
                    },
                    source="agent_supervisor",
                    phase="ADAPT",
                )
            await asyncio.sleep(1.0)
