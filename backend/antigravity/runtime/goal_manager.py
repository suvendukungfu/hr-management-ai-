from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import asdict, dataclass, field
from typing import Any, Dict

from antigravity.runtime.event_bus import event_bus


@dataclass
class GoalItem:
    goal_id: str
    goal: str
    urgency: float = 0.5
    success_probability: float = 0.6
    failure_penalty: float = 0.0
    memory_relevance_score: float = 0.0
    confidence_weight: float = 1.0
    attempts: int = 0
    created_at: float = field(default_factory=time.time)
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["created_at"] = int(self.created_at * 1000)
        payload["priority"] = 0.0
        return payload


class GoalManager:
    """
    Adaptive goal prioritization with dynamic aging and penalties.
    """

    def __init__(self):
        self._goals: dict[str, GoalItem] = {}
        self._history: dict[str, dict[str, float]] = {}
        self._urgency_weight = 1.4
        self._aging_weight = 0.35
        self._failure_weight = 0.9

    def add_goal(
        self,
        goal: str,
        *,
        urgency: float = 0.5,
        success_probability: float = 0.6,
        tags: list[str] | None = None,
    ) -> GoalItem:
        item = GoalItem(
            goal_id=str(uuid.uuid4()),
            goal=goal,
            urgency=self._clamp(urgency),
            success_probability=self._clamp(success_probability),
            tags=list(tags or []),
        )
        history = self._history.get(goal, {})
        item.failure_penalty = self._clamp(float(history.get("failure_penalty", 0.0)))
        item.memory_relevance_score = self._clamp(
            float(history.get("memory_relevance_score", 0.0))
        )
        self._goals[item.goal_id] = item
        self._emit_event("goal:queued", {"goal": item.goal, "goal_id": item.goal_id})
        return item

    def pop_next(self) -> GoalItem | None:
        if not self._goals:
            return None
        ranked = sorted(
            self._goals.values(),
            key=self._priority,
            reverse=True,
        )
        selected = ranked[0]
        selected.attempts += 1
        self._goals.pop(selected.goal_id, None)
        self._emit_event(
            "goal:dispatched",
            {
                "goal_id": selected.goal_id,
                "goal": selected.goal,
                "priority": round(self._priority(selected), 4),
            },
        )
        return selected

    def has_pending(self) -> bool:
        return bool(self._goals)

    def update_feedback(
        self,
        goal_id: str,
        *,
        success: bool | None = None,
        reflection_score: float | None = None,
        failed: bool = False,
        memory_relevance_score: float | None = None,
    ) -> None:
        item = self._goals.get(goal_id)
        if not item:
            return
        if success is not None:
            delta = 0.1 if success else -0.2
            item.success_probability = self._clamp(item.success_probability + delta)
        if failed:
            item.failure_penalty = self._clamp(item.failure_penalty + 0.2)
        if reflection_score is not None:
            item.confidence_weight = self._clamp(item.confidence_weight * 0.7 + reflection_score * 0.3)
        if memory_relevance_score is not None:
            item.memory_relevance_score = self._clamp(memory_relevance_score)

        self._emit_event(
            "goal:reprioritized",
            {
                "goal_id": goal_id,
                "goal": item.goal,
                "priority": round(self._priority(item), 4),
            },
        )

    def record_outcome(
        self,
        goal: str,
        *,
        success: bool,
        reflection_score: float,
        memory_relevance_score: float,
    ) -> None:
        history = self._history.setdefault(goal, {})
        prior_failure = float(history.get("failure_penalty", 0.0))
        if success:
            history["failure_penalty"] = self._clamp(prior_failure * 0.7)
        else:
            history["failure_penalty"] = self._clamp(prior_failure + 0.2)
        history["memory_relevance_score"] = self._clamp(memory_relevance_score)
        history["confidence_weight"] = self._clamp(reflection_score)

    def reprioritize_goal(self, item: GoalItem) -> None:
        self._goals[item.goal_id] = item
        self._emit_event(
            "goal:reprioritized",
            {"goal_id": item.goal_id, "goal": item.goal, "priority": round(self._priority(item), 4)},
        )

    def snapshot(self) -> list[dict[str, Any]]:
        ranked = sorted(self._goals.values(), key=self._priority, reverse=True)
        payload: list[dict[str, Any]] = []
        for item in ranked:
            row = item.to_dict()
            row["priority"] = round(self._priority(item), 4)
            payload.append(row)
        return payload

    def _priority(self, goal: GoalItem) -> float:
        age_minutes = max((time.time() - goal.created_at) / 60.0, 0.0)
        age_score = min(age_minutes / 10.0, 1.0)
        priority = (
            (self._urgency_weight * goal.urgency)
            + goal.success_probability
            - (self._failure_weight * goal.failure_penalty)
            + goal.memory_relevance_score
            + (self._aging_weight * age_score)
        ) * max(goal.confidence_weight, 0.1)
        return priority

    def _emit_event(self, topic: str, data: dict[str, Any]) -> None:
        try:
            asyncio.get_running_loop().create_task(
                event_bus.emit(topic, data, source="goal_manager", phase="ADAPT")
            )
        except RuntimeError:
            # No active loop while importing/tests; this is safe to ignore.
            pass

    def _clamp(self, value: float) -> float:
        return max(0.0, min(1.0, value))
