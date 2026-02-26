from __future__ import annotations

import asyncio
import json
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Awaitable, Callable, Dict, Iterable, Literal, TypedDict

if TYPE_CHECKING:
    from fastapi import WebSocket
else:
    WebSocket = Any

ResearchTopic = Literal[
    "planner:reasoning",
    "planner:perceive",
    "planner:graph_update",
    "planner:route",
    "planner:strategy",
    "reflection:summary",
    "reflection:warning",
    "memory:episodic_added",
    "memory:semantic_added",
    "memory:retrieval_snapshot",
    "memory:working_update",
    "goal:queued",
    "goal:dispatched",
    "goal:reprioritized",
    "TOOL_STARTED",
    "TOOL_STREAM",
    "TOOL_FINISHED",
    "TOOL_FAILED",
    "TOOL_CANCELLED",
    "SELF_EVAL_READY",
    "RECOVERY_TRIGGERED",
    "agent:lifecycle",
    "agent:spawn",
    "simulation:progress",
    "simulation:complete",
    "system:boot",
    "system:error",
    "system:stopped",
    "system:complete",
    "research:metric",
]


class EventEnvelope(TypedDict, total=False):
    topic: str
    data: Any
    timestamp: int
    trace_id: str
    source: str
    phase: str


Subscriber = Callable[[EventEnvelope], Awaitable[None] | None]


@dataclass
class EventBusMetrics:
    events_emitted: int = 0
    dispatch_failures: int = 0
    websocket_broadcast_failures: int = 0
    avg_emit_ms: float = 0.0

    def to_dict(self) -> Dict[str, float | int]:
        return {
            "events_emitted": self.events_emitted,
            "dispatch_failures": self.dispatch_failures,
            "websocket_broadcast_failures": self.websocket_broadcast_failures,
            "avg_emit_ms": round(self.avg_emit_ms, 3),
        }


class EventBus:
    """
    Typed, observable EventBus used by the autonomous runtime.

    This bus remains backward-compatible with the previous `.emit(topic, data)`
    style while providing structured envelopes for research telemetry.
    """

    def __init__(self, *, history_limit: int = 5000):
        self._history_limit = history_limit
        self._history: list[EventEnvelope] = []
        self._subscribers: Dict[str, list[Subscriber]] = defaultdict(list)
        self._websockets: list[WebSocket] = []
        self._metrics = EventBusMetrics()

    def subscribe(self, topic: str, callback: Subscriber) -> None:
        self._subscribers[topic].append(callback)

    def unsubscribe(self, topic: str, callback: Subscriber) -> None:
        subscribers = self._subscribers.get(topic)
        if not subscribers:
            return
        try:
            subscribers.remove(callback)
        except ValueError:
            return

    async def connect_websocket(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._websockets.append(websocket)
        for envelope in self._history:
            await websocket.send_text(json.dumps(envelope, default=str))

    def disconnect_websocket(self, websocket: WebSocket) -> None:
        if websocket in self._websockets:
            self._websockets.remove(websocket)

    async def emit(
        self,
        topic: str,
        data: Any,
        *,
        source: str = "runtime",
        trace_id: str | None = None,
        phase: str | None = None,
    ) -> EventEnvelope:
        start = time.perf_counter()
        envelope: EventEnvelope = {
            "topic": topic,
            "data": data,
            "timestamp": int(time.time() * 1000),
            "trace_id": trace_id or str(uuid.uuid4()),
            "source": source,
        }
        if phase:
            envelope["phase"] = phase

        self._history.append(envelope)
        if len(self._history) > self._history_limit:
            self._history = self._history[-self._history_limit :]

        await self._dispatch_to_subscribers(envelope)
        await self._broadcast_to_websockets(envelope)

        self._metrics.events_emitted += 1
        emit_ms = (time.perf_counter() - start) * 1000
        n = self._metrics.events_emitted
        self._metrics.avg_emit_ms = (
            ((self._metrics.avg_emit_ms * (n - 1)) + emit_ms) / n
            if n > 0
            else emit_ms
        )
        return envelope

    async def publish(self, topic: str, data: Any) -> EventEnvelope:
        # Backward-compatible alias for earlier event bus versions.
        return await self.emit(topic, data)

    def iter_history(self) -> Iterable[EventEnvelope]:
        return tuple(self._history)

    def get_metrics(self) -> Dict[str, Any]:
        return {
            **self._metrics.to_dict(),
            "websocket_clients": len(self._websockets),
            "subscriber_topics": len(self._subscribers),
            "history_size": len(self._history),
        }

    async def _dispatch_to_subscribers(self, envelope: EventEnvelope) -> None:
        callbacks = list(self._subscribers.get(envelope["topic"], []))
        callbacks.extend(self._subscribers.get("*", []))
        for callback in callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(envelope)
                else:
                    result = callback(envelope)
                    if asyncio.iscoroutine(result):
                        await result
            except Exception:
                self._metrics.dispatch_failures += 1

    async def _broadcast_to_websockets(self, envelope: EventEnvelope) -> None:
        dead: list[WebSocket] = []
        payload = json.dumps(envelope, default=str)
        for ws in self._websockets:
            try:
                await ws.send_text(payload)
            except Exception:
                self._metrics.websocket_broadcast_failures += 1
                dead.append(ws)
        for ws in dead:
            self.disconnect_websocket(ws)


event_bus = EventBus()
