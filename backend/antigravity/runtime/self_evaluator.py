from __future__ import annotations

import time
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, Sequence

from antigravity.runtime.event_bus import event_bus


@dataclass
class EvaluationRecord:
    success_score: float
    efficiency_score: float
    safety_score: float
    learning_value: float
    aggregate: float
    timestamp: int = field(default_factory=lambda: int(time.time() * 1000))

    def to_dict(self) -> Dict[str, float | int]:
        payload = asdict(self)
        for key in (
            "success_score",
            "efficiency_score",
            "safety_score",
            "learning_value",
            "aggregate",
        ):
            payload[key] = round(float(payload[key]), 4)
        return payload


class SelfEvaluator:
    """Research-focused post-cycle evaluation engine."""

    def __init__(self):
        self._history: list[EvaluationRecord] = []

    async def evaluate(
        self,
        *,
        plan: Sequence[dict[str, Any]],
        actions: Sequence[str],
        outcome: dict[str, Any],
        reflection_score: float,
        duration_ms: float,
        safety_incidents: int = 0,
        trace_id: str | None = None,
    ) -> dict[str, float | int]:
        success_score = self._score_success(outcome)
        efficiency_score = self._score_efficiency(duration_ms, len(actions), len(plan))
        safety_score = self._score_safety(safety_incidents)
        learning_value = self._score_learning(reflection_score, outcome)
        aggregate = (success_score + efficiency_score + safety_score + learning_value) / 4.0

        record = EvaluationRecord(
            success_score=success_score,
            efficiency_score=efficiency_score,
            safety_score=safety_score,
            learning_value=learning_value,
            aggregate=aggregate,
        )
        self._history.append(record)

        payload = record.to_dict()
        await event_bus.emit(
            "SELF_EVAL_READY",
            payload,
            source="self_evaluator",
            trace_id=trace_id,
            phase="SCORE",
        )
        return payload

    def get_metrics(self) -> dict[str, float]:
        if not self._history:
            return {"self_eval.aggregate": 0.0}
        aggregate = sum(item.aggregate for item in self._history) / len(self._history)
        return {"self_eval.aggregate": round(aggregate, 4)}

    def _score_success(self, outcome: dict[str, Any]) -> float:
        explicit = outcome.get("success_score")
        if explicit is not None:
            return self._clamp(float(explicit))
        status = str(outcome.get("status", "")).lower()
        if status in {"success", "completed", "ok"}:
            return 1.0
        if status in {"partial", "warning"}:
            return 0.6
        return 0.2

    def _score_efficiency(
        self,
        duration_ms: float,
        action_count: int,
        plan_steps: int,
    ) -> float:
        duration_factor = 1.0 - min(max(duration_ms, 0.0), 120000.0) / 120000.0
        complexity_ratio = 1.0
        if plan_steps > 0:
            complexity_ratio = min(action_count / plan_steps, 2.0)
        complexity_factor = 1.0 - abs(1.0 - complexity_ratio) * 0.25
        return self._clamp((duration_factor * 0.7) + (complexity_factor * 0.3))

    def _score_safety(self, safety_incidents: int) -> float:
        return self._clamp(1.0 - min(max(safety_incidents, 0), 5) * 0.2)

    def _score_learning(self, reflection_score: float, outcome: dict[str, Any]) -> float:
        novelty = 0.0
        if outcome.get("recovered"):
            novelty += 0.15
        if outcome.get("fallback_used"):
            novelty += 0.1
        base = self._clamp(reflection_score)
        return self._clamp((base * 0.85) + novelty)

    def _clamp(self, value: float) -> float:
        return max(0.0, min(1.0, value))
