from __future__ import annotations

import asyncio
import logging
import time
from pathlib import Path
from typing import Any

from antigravity.planners.self_evolving import planner_engine
from antigravity.runtime.agent_supervisor import AgentSupervisor
from antigravity.runtime.event_bus import event_bus
from antigravity.runtime.goal_manager import GoalItem, GoalManager
from antigravity.runtime.memory_manager import MemoryManager
from antigravity.runtime.parallel_loop import ParallelLoop
from antigravity.runtime.self_evaluator import SelfEvaluator
from antigravity.runtime.tool_runner import CancellationToken, ToolRunner
from antigravity.state.store import state_store

logger = logging.getLogger(__name__)


class AutonomousOrchestrator:
    """
    Research loop:
    PERCEIVE -> PLAN -> EXECUTE -> REFLECT -> SCORE -> ADAPT -> REPLAN

    Every phase emits typed events and avoids direct cross-module state mutation.
    """

    def __init__(self):
        self.is_running = False
        self._loop_task: asyncio.Task[None] | None = None

        self.memory = MemoryManager()
        self.goal_manager = GoalManager()
        self.self_evaluator = SelfEvaluator()
        self.agent_supervisor = AgentSupervisor(max_concurrency=3, stall_timeout_seconds=40.0)
        self.tool_runner = ToolRunner(
            working_dir=Path(__file__).resolve().parents[2],
            allow_list={"echo", "python3", "ls", "pwd"},
            timeout_seconds=20.0,
            output_size_limit=24_000,
        )

        self._tool_failure_streak = 0
        self._low_reflection_streak = 0
        self._recent_plan_signatures: list[str] = []
        self._metrics: dict[str, float | int] = {
            "planner.cycle_ms": 0.0,
            "executor.duration_ms": 0.0,
            "reflection.score": 0.0,
            "self_eval.aggregate": 0.0,
            "memory.hit_rate": 0.0,
            "recovery.triggers": 0,
        }

        state_store.init_agents(
            [
                "Recruiter Agent",
                "Scheduler Agent",
                "Analytics Agent",
                "Bias Detection Agent",
            ]
        )

    async def start(self) -> None:
        await self.agent_supervisor.start()

    def add_goal(self, goal: str) -> None:
        queued = self.goal_manager.add_goal(goal, urgency=0.7, success_probability=0.65)
        if not self.is_running and (self._loop_task is None or self._loop_task.done()):
            self._loop_task = asyncio.create_task(self.run_loop())
        logger.info("research.loop", extra={"phase": "GOAL_ENQUEUE", "goal_id": queued.goal_id})

    async def stop(self) -> None:
        self.is_running = False
        if self._loop_task and not self._loop_task.done():
            await asyncio.wait({self._loop_task}, timeout=0.2)
        await self.agent_supervisor.stop()
        state_store.set_system_status("IDLE")
        await event_bus.emit("system:stopped", "Mission Control halted.")

    async def run_loop(self) -> None:
        if self.is_running:
            return

        self.is_running = True
        await self.start()
        state_store.set_system_status("ACTIVE")
        await event_bus.emit("system:boot", "Autonomous core initialized.")

        try:
            while self.is_running:
                goal_item = self.goal_manager.pop_next()
                if goal_item is None:
                    break
                await self._run_goal_cycle(goal_item)
        except Exception as exc:
            state_store.set_system_status("IDLE")
            await event_bus.emit("system:error", f"Orchestrator fault: {exc}")
        finally:
            self.is_running = False
            state_store.set_system_status("IDLE")

    async def _run_goal_cycle(self, goal_item: GoalItem) -> None:
        cycle_started = time.perf_counter()
        trace_id = goal_item.goal_id
        state_store.set_current_goal(goal_item.goal)
        state_store.set_simulation_progress(0)
        await self.memory.update_working(
            active_goal=goal_item.goal,
            event={"phase": "PERCEIVE", "goal_id": goal_item.goal_id},
        )

        # PERCEIVE: query memory for context prior to planning.
        memory_hits = self.memory.retrieve(goal_item.goal, scope="all", k=5)
        memory_relevance_score = min(1.0, len(memory_hits) / 5.0)
        await event_bus.emit(
            "memory:retrieval_snapshot",
            {"goal_id": goal_item.goal_id, "goal": goal_item.goal, "hits": memory_hits},
            trace_id=trace_id,
            source="orchestrator",
            phase="PERCEIVE",
        )
        await event_bus.emit(
            "planner:reasoning",
            {
                "goal_id": goal_item.goal_id,
                "phase": "PERCEIVE",
                "summary": f"Retrieved {len(memory_hits)} memory hints before planning.",
            },
            trace_id=trace_id,
            source="orchestrator",
            phase="PERCEIVE",
        )

        # PLAN: planner agent builds graph after memory retrieval.
        await self.agent_supervisor.run(
            "planner_agent",
            lambda: planner_engine.build_plan(goal_item.goal),
            timeout_seconds=20.0,
            trace_id=trace_id,
        )
        plan_nodes = [dict(node) for node in planner_engine.graph]
        plan_signature = "|".join(node.get("id", "?") for node in plan_nodes)
        self._recent_plan_signatures.append(plan_signature)
        self._recent_plan_signatures = self._recent_plan_signatures[-5:]
        planner_dead_loop = self._recent_plan_signatures.count(plan_signature) >= 3

        await event_bus.emit(
            "planner:reasoning",
            {
                "goal_id": goal_item.goal_id,
                "phase": "PLAN",
                "summary": "Plan graph generated from memory-aware strategy hints.",
                "plan_nodes": plan_nodes,
            },
            trace_id=trace_id,
            source="orchestrator",
            phase="PLAN",
        )

        # EXECUTE: tool runner streams output + agent fleet executes.
        state_store.set_system_status("SIMULATING")
        state_store.set_simulation_progress(10)
        cancel_token = CancellationToken()

        tool_result = await self.agent_supervisor.run(
            "executor_agent",
            lambda: self.tool_runner.run(
                ["echo", f"executing-goal:{goal_item.goal}"],
                cancel_token=cancel_token,
                trace_id=trace_id,
            ),
            timeout_seconds=25.0,
            trace_id=trace_id,
        )

        batch_results = await self.agent_supervisor.run(
            "executor_agent",
            lambda: ParallelLoop.run_batch(
                ["Recruiter Agent", "Analytics Agent", "Bias Detection Agent", "Scheduler Agent"],
                {"task": goal_item.goal},
            ),
            timeout_seconds=80.0,
            trace_id=trace_id,
        )
        state_store.set_simulation_progress(95)
        state_store.set_system_status("ACTIVE")
        self._metrics["executor.duration_ms"] = tool_result.duration_ms

        tool_failed = tool_result.exit_code != 0 or tool_result.cancelled
        if tool_failed:
            self._tool_failure_streak += 1
        else:
            self._tool_failure_streak = 0

        # REFLECT: detect failures and dead-loops, store episodic traces.
        action_failures = sum(1 for item in batch_results if isinstance(item, Exception))
        reflection_score = max(
            0.0,
            min(
                1.0,
                1.0
                - (0.2 if tool_failed else 0.0)
                - (action_failures * 0.15)
                - (0.1 if planner_dead_loop else 0.0),
            ),
        )
        if reflection_score < 0.45:
            self._low_reflection_streak += 1
        else:
            self._low_reflection_streak = 0

        reflection_summary = {
            "goal_id": goal_item.goal_id,
            "goal": goal_item.goal,
            "reflection_score": round(reflection_score, 4),
            "tool_failed": tool_failed,
            "action_failures": action_failures,
            "planner_dead_loop": planner_dead_loop,
        }
        state_store.append_reflection_log(
            {"goal": goal_item.goal, "score": str(round(reflection_score, 3))}
        )
        self._metrics["reflection.score"] = reflection_score

        await event_bus.emit(
            "reflection:summary",
            reflection_summary,
            trace_id=trace_id,
            source="orchestrator",
            phase="REFLECT",
        )

        await self.memory.add_episodic(
            {
                "goal": goal_item.goal,
                "plan": plan_nodes,
                "actions": [node.get("id", "unknown") for node in plan_nodes],
                "outcome": "failed" if tool_failed or action_failures else "success",
                "reflection_score": reflection_score,
                "tags": ["autonomous-loop", "research-runtime"],
                "timestamp": time.time(),
            }
        )

        # SCORE: self-evaluator emits SELF_EVAL_READY.
        cycle_ms = (time.perf_counter() - cycle_started) * 1000
        eval_payload = await self.agent_supervisor.run(
            "evaluator_agent",
            lambda: self.self_evaluator.evaluate(
                plan=plan_nodes,
                actions=[node.get("id", "unknown") for node in plan_nodes],
                outcome={
                    "status": "success" if not tool_failed and action_failures == 0 else "partial",
                    "success_score": reflection_score,
                    "recovered": False,
                    "fallback_used": False,
                },
                reflection_score=reflection_score,
                duration_ms=cycle_ms,
                safety_incidents=1 if tool_failed else 0,
                trace_id=trace_id,
            ),
            timeout_seconds=15.0,
            trace_id=trace_id,
        )
        confidence = int(float(eval_payload["aggregate"]) * 100)
        state_store.set_confidence_index(confidence)
        self._metrics["self_eval.aggregate"] = float(eval_payload["aggregate"])

        # ADAPT + REPLAN: trigger recovery when the runtime degrades.
        needs_recovery = (
            self._tool_failure_streak >= 2
            or self._low_reflection_streak >= 2
            or planner_dead_loop
        )
        success = not needs_recovery and not tool_failed and action_failures == 0

        self.goal_manager.record_outcome(
            goal_item.goal,
            success=success,
            reflection_score=float(eval_payload["learning_value"]),
            memory_relevance_score=memory_relevance_score,
        )
        await self.memory.add_semantic(
            {
                "summary": (
                    f"Goal '{goal_item.goal}' completed "
                    f"{'successfully' if success else 'with degradation'}."
                ),
                "tags": ["self-eval", "recovery" if needs_recovery else "stable"],
                "scores": eval_payload,
                "timestamp": int(time.time() * 1000),
            }
        )

        if needs_recovery:
            await self._recover(goal_item, trace_id=trace_id, planner_dead_loop=planner_dead_loop)

        state_store.set_simulation_progress(100)
        state_store.set_system_status("IDLE")
        self._metrics["planner.cycle_ms"] = round(cycle_ms, 3)
        self._metrics["memory.hit_rate"] = float(self.memory.get_metrics()["memory.hit_rate"])

        await event_bus.emit(
            "research:metric",
            dict(self._metrics),
            source="orchestrator",
            trace_id=trace_id,
            phase="ADAPT",
        )
        logger.info(
            "research.loop",
            extra={"phase": "SELF_EVAL", "score": float(eval_payload["success_score"])},
        )
        await event_bus.emit("system:complete", "Goal matrix resolved.")

    async def _recover(
        self,
        goal_item: GoalItem,
        *,
        trace_id: str,
        planner_dead_loop: bool,
    ) -> None:
        self._metrics["recovery.triggers"] = int(self._metrics["recovery.triggers"]) + 1
        if planner_dead_loop:
            strategy = "spawn_alternative_planner_agent"
            self.agent_supervisor.register_role("planner_agent_alt", "Planner Agent Alt")
            await self.agent_supervisor.run(
                "planner_agent_alt",
                lambda: planner_engine.build_plan(f"{goal_item.goal} [alternative-route]"),
                timeout_seconds=20.0,
                trace_id=trace_id,
            )
            self.goal_manager.add_goal(
                f"{goal_item.goal} (alternative plan)",
                urgency=0.85,
                success_probability=0.55,
                tags=["recovery", "alt-planner"],
            )
        elif self._tool_failure_streak >= 2:
            strategy = "fallback_safe_minimal_plan"
            self.goal_manager.add_goal(
                f"{goal_item.goal} (safe minimal fallback)",
                urgency=1.0,
                success_probability=0.7,
                tags=["recovery", "safe-fallback"],
            )
        else:
            strategy = "modify_constraints_and_replan"
            self.goal_manager.add_goal(
                f"{goal_item.goal} (constraint-relaxed replan)",
                urgency=0.8,
                success_probability=0.6,
                tags=["recovery", "constraint-relaxed"],
            )

        await event_bus.emit(
            "RECOVERY_TRIGGERED",
            {
                "goal_id": goal_item.goal_id,
                "goal": goal_item.goal,
                "strategy": strategy,
                "tool_failure_streak": self._tool_failure_streak,
                "low_reflection_streak": self._low_reflection_streak,
                "planner_dead_loop": planner_dead_loop,
            },
            source="orchestrator",
            trace_id=trace_id,
            phase="REPLAN",
        )

    def get_metrics(self) -> dict[str, float | int]:
        return {
            **self._metrics,
            **self.memory.get_metrics(),
            **self.self_evaluator.get_metrics(),
            "supervisor": self.agent_supervisor.snapshot(),
            "event_bus": event_bus.get_metrics(),
            "queued_goals": self.goal_manager.snapshot(),
        }


orchestrator = AutonomousOrchestrator()
