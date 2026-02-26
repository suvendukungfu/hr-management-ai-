from __future__ import annotations

import asyncio
import os
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

from antigravity.runtime.event_bus import event_bus


@dataclass
class CancellationToken:
    cancelled: bool = False
    reason: str = "cancelled"

    def cancel(self, reason: str = "cancelled") -> None:
        self.cancelled = True
        self.reason = reason


@dataclass
class ToolResult:
    command: list[str]
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float
    cancelled: bool = False

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["duration_ms"] = round(self.duration_ms, 3)
        return payload


class ToolRunner:
    """
    Streaming tool execution runtime with cancellation, output limits and allow-list guards.
    """

    def __init__(
        self,
        *,
        working_dir: Path,
        allow_list: Iterable[str] | None = None,
        timeout_seconds: float = 45.0,
        output_size_limit: int = 64_000,
    ):
        self._working_dir = working_dir.resolve()
        self._allow_list = set(allow_list or {"echo", "ls", "pwd", "cat", "python3"})
        self._timeout_seconds = timeout_seconds
        self._output_size_limit = output_size_limit

    async def run(
        self,
        command: Sequence[str],
        *,
        cancel_token: CancellationToken | None = None,
        timeout_seconds: float | None = None,
        trace_id: str | None = None,
    ) -> ToolResult:
        command_list = [part for part in command if part]
        self._validate_command(command_list)
        self._validate_workdir()
        timeout = timeout_seconds or self._timeout_seconds
        token = cancel_token or CancellationToken()
        started = time.perf_counter()

        await event_bus.emit(
            "TOOL_STARTED",
            {"command": command_list, "timeout_seconds": timeout},
            source="tool_runner",
            trace_id=trace_id,
            phase="EXECUTE",
        )

        process = await asyncio.create_subprocess_exec(
            *command_list,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(self._working_dir),
            env=self._safe_env(),
        )

        stdout_chunks: list[str] = []
        stderr_chunks: list[str] = []
        total_output = 0

        async def _read_stream(stream: asyncio.StreamReader | None, stream_name: str) -> None:
            nonlocal total_output
            if stream is None:
                return
            while True:
                chunk = await stream.readline()
                if not chunk:
                    break
                text = chunk.decode(errors="replace")
                total_output += len(text.encode("utf-8", errors="replace"))
                if stream_name == "stdout":
                    stdout_chunks.append(text)
                else:
                    stderr_chunks.append(text)

                await event_bus.emit(
                    "TOOL_STREAM",
                    {"stream": stream_name, "chunk": text.rstrip("\n")},
                    source="tool_runner",
                    trace_id=trace_id,
                    phase="EXECUTE",
                )

        stdout_task = asyncio.create_task(_read_stream(process.stdout, "stdout"))
        stderr_task = asyncio.create_task(_read_stream(process.stderr, "stderr"))

        try:
            while process.returncode is None:
                if token.cancelled:
                    process.terminate()
                    await process.wait()
                    result = ToolResult(
                        command=command_list,
                        exit_code=-1,
                        stdout="".join(stdout_chunks),
                        stderr="".join(stderr_chunks) + f"\n{token.reason}",
                        duration_ms=(time.perf_counter() - started) * 1000,
                        cancelled=True,
                    )
                    await event_bus.emit(
                        "TOOL_CANCELLED",
                        result.to_dict(),
                        source="tool_runner",
                        trace_id=trace_id,
                        phase="EXECUTE",
                    )
                    return result

                if total_output > self._output_size_limit:
                    token.cancel(
                        f"output_size_limit_exceeded ({self._output_size_limit} bytes)"
                    )
                    continue

                elapsed = time.perf_counter() - started
                if elapsed > timeout:
                    token.cancel(f"timeout_exceeded ({timeout:.2f}s)")
                    continue

                await asyncio.sleep(0.05)

            await asyncio.gather(stdout_task, stderr_task)

            result = ToolResult(
                command=command_list,
                exit_code=int(process.returncode or 0),
                stdout="".join(stdout_chunks),
                stderr="".join(stderr_chunks),
                duration_ms=(time.perf_counter() - started) * 1000,
            )
            topic = "TOOL_FINISHED" if result.exit_code == 0 else "TOOL_FAILED"
            await event_bus.emit(
                topic,
                result.to_dict(),
                source="tool_runner",
                trace_id=trace_id,
                phase="EXECUTE",
            )
            return result
        except Exception as exc:
            if process.returncode is None:
                process.terminate()
                await process.wait()
            await asyncio.gather(stdout_task, stderr_task, return_exceptions=True)
            result = ToolResult(
                command=command_list,
                exit_code=-1,
                stdout="".join(stdout_chunks),
                stderr="".join(stderr_chunks) + f"\n{exc}",
                duration_ms=(time.perf_counter() - started) * 1000,
            )
            await event_bus.emit(
                "TOOL_FAILED",
                result.to_dict(),
                source="tool_runner",
                trace_id=trace_id,
                phase="EXECUTE",
            )
            return result

    def _validate_command(self, command: Sequence[str]) -> None:
        if not command:
            raise ValueError("Command cannot be empty.")
        executable = command[0]
        if executable not in self._allow_list:
            raise PermissionError(
                f"Command '{executable}' is not in the allow-list: {sorted(self._allow_list)}"
            )

    def _validate_workdir(self) -> None:
        if not self._working_dir.exists() or not self._working_dir.is_dir():
            raise FileNotFoundError(f"Working dir does not exist: {self._working_dir}")

    def _safe_env(self) -> dict[str, str]:
        # Minimal environment to reduce shell/tool side effects.
        safe_keys = {"PATH", "HOME", "LANG", "LC_ALL", "PYTHONPATH"}
        return {key: value for key, value in os.environ.items() if key in safe_keys}
