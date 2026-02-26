from __future__ import annotations

import time
from collections import deque
from dataclasses import asdict, dataclass, field
from typing import Any, Deque, Dict, Iterable, Literal

from antigravity.runtime.event_bus import event_bus

MemoryScope = Literal["episodic", "semantic", "all"]


@dataclass
class MemoryEntry:
    goal: str
    plan: list[dict[str, Any]]
    actions: list[str]
    outcome: str
    reflection_score: float
    tags: list[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["timestamp"] = int(self.timestamp * 1000)
        return data


class MemoryManager:
    """
    Multi-tier memory subsystem:
    - working memory for active context
    - episodic memory for execution timeline
    - semantic memory for abstracted summaries and hints
    """

    def __init__(
        self,
        *,
        episodic_limit: int = 1000,
        semantic_limit: int = 300,
        working_events_limit: int = 50,
    ):
        self._working: dict[str, Any] = {
            "active_goal": None,
            "latest_events": deque(maxlen=working_events_limit),
        }
        self._episodic: Deque[MemoryEntry] = deque(maxlen=episodic_limit)
        self._semantic: Deque[dict[str, Any]] = deque(maxlen=semantic_limit)
        self._retrieve_calls = 0
        self._retrieve_hits = 0

    async def update_working(
        self,
        *,
        active_goal: str | None = None,
        event: dict[str, Any] | None = None,
    ) -> None:
        if active_goal is not None:
            self._working["active_goal"] = active_goal
        if event is not None:
            event_with_ts = {**event, "timestamp": int(time.time() * 1000)}
            self._working["latest_events"].append(event_with_ts)

        await event_bus.emit(
            "memory:working_update",
            {
                "active_goal": self._working["active_goal"],
                "latest_events_count": len(self._working["latest_events"]),
            },
            source="memory_manager",
            phase="PERCEIVE",
        )

    async def add_episodic(self, entry: MemoryEntry | dict[str, Any]) -> None:
        if isinstance(entry, MemoryEntry):
            normalized = entry
        else:
            normalized = MemoryEntry(
                goal=entry.get("goal", "unknown"),
                plan=list(entry.get("plan", [])),
                actions=list(entry.get("actions", [])),
                outcome=str(entry.get("outcome", "unknown")),
                reflection_score=float(entry.get("reflection_score", 0.0)),
                tags=list(entry.get("tags", [])),
                timestamp=float(entry.get("timestamp", time.time())),
            )

        self._episodic.append(normalized)
        await event_bus.emit(
            "memory:episodic_added",
            normalized.to_dict(),
            source="memory_manager",
            phase="REFLECT",
        )

    async def add_semantic(self, summary: dict[str, Any] | str) -> None:
        if isinstance(summary, str):
            record: dict[str, Any] = {
                "summary": summary,
                "tags": [],
                "timestamp": int(time.time() * 1000),
            }
        else:
            record = dict(summary)
            record.setdefault("tags", [])
            record.setdefault("timestamp", int(time.time() * 1000))
        self._semantic.append(record)
        await event_bus.emit(
            "memory:semantic_added",
            record,
            source="memory_manager",
            phase="ADAPT",
        )

    def retrieve(
        self,
        query: str,
        *,
        scope: MemoryScope = "all",
        k: int = 5,
    ) -> list[dict[str, Any]]:
        self._retrieve_calls += 1
        normalized_query = query.lower().strip()
        if not normalized_query:
            return []

        candidates: list[dict[str, Any]] = []
        if scope in ("episodic", "all"):
            for item in self._episodic:
                candidates.append(item.to_dict())
        if scope in ("semantic", "all"):
            candidates.extend(self._semantic)

        ranked = sorted(
            candidates,
            key=lambda item: self._score_item(item, normalized_query),
            reverse=True,
        )
        results = [item for item in ranked if self._score_item(item, normalized_query) > 0][
            : max(1, k)
        ]
        if results:
            self._retrieve_hits += 1
        return results

    def get_snapshot(self) -> dict[str, Any]:
        return {
            "working": {
                "active_goal": self._working["active_goal"],
                "latest_events": list(self._working["latest_events"]),
            },
            "episodic": [item.to_dict() for item in list(self._episodic)[-5:]],
            "semantic": list(self._semantic)[-5:],
            "metrics": self.get_metrics(),
        }

    def get_metrics(self) -> dict[str, Any]:
        hit_rate = (
            (self._retrieve_hits / self._retrieve_calls)
            if self._retrieve_calls
            else 0.0
        )
        return {
            "memory.hit_rate": round(hit_rate, 4),
            "memory.retrieve_calls": self._retrieve_calls,
            "memory.retrieve_hits": self._retrieve_hits,
            "memory.episodic_size": len(self._episodic),
            "memory.semantic_size": len(self._semantic),
        }

    def _score_item(self, item: dict[str, Any], query: str) -> float:
        haystacks: Iterable[str] = (
            str(item.get("goal", "")),
            str(item.get("outcome", "")),
            str(item.get("summary", "")),
            " ".join(str(tag) for tag in item.get("tags", [])),
            " ".join(str(action) for action in item.get("actions", [])),
        )

        score = 0.0
        for text in haystacks:
            normalized = text.lower()
            if not normalized:
                continue
            if query in normalized:
                score += 1.0
            query_tokens = [token for token in query.split(" ") if token]
            token_hits = sum(1 for token in query_tokens if token in normalized)
            score += token_hits * 0.2
        return score
