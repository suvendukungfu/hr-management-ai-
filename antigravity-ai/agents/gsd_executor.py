"""GSD executor plugin for safe command execution within the target project."""

from __future__ import annotations

import shlex
import subprocess
from pathlib import Path

from config import TARGET_PROJECT, register_plugin

_ALLOWED_COMMANDS = {
    "ls",
    "pwd",
    "cat",
    "rg",
    "find",
    "sed",
    "head",
    "tail",
    "wc",
    "git",
}

_FORBIDDEN_TOKENS = {"|", "||", "&&", ";", ">", "<", "$(", "`"}
_BLOCKED_GIT_SUBCOMMANDS = {"reset", "clean", "checkout", "rebase", "am", "cherry-pick"}
_OUTPUT_LIMIT_BYTES = 20_000


def _resolve_workdir() -> Path:
    if TARGET_PROJECT.exists():
        return TARGET_PROJECT
    return Path.cwd()


def run(command: str, timeout_seconds: int = 20) -> str:
    """Execute an allow-listed command and return a readable result string."""
    cleaned = command.strip()
    if not cleaned:
        return "Command rejected: input was empty."
    if any(token in cleaned for token in _FORBIDDEN_TOKENS):
        return "Command blocked by safety policy: shell control operators are not allowed."

    try:
        args = shlex.split(cleaned)
    except ValueError as exc:
        return f"Command rejected: could not parse command ({exc})."

    if not args:
        return "Command rejected: no executable found."

    executable = args[0].lower()
    if executable not in _ALLOWED_COMMANDS:
        return (
            f"Command blocked by allow-list policy: '{args[0]}'. "
            f"Allowed commands: {', '.join(sorted(_ALLOWED_COMMANDS))}."
        )
    if executable == "git" and len(args) > 1 and args[1].lower() in _BLOCKED_GIT_SUBCOMMANDS:
        return f"Command blocked by safety policy: git {args[1]} is not allowed."

    try:
        completed = subprocess.run(
            args,
            cwd=_resolve_workdir(),
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    except FileNotFoundError:
        return f"Command failed: executable not found ({args[0]})."
    except subprocess.TimeoutExpired:
        return f"Command timed out after {timeout_seconds} seconds."
    except Exception as exc:  # pragma: no cover - defensive guard.
        return f"Command failed unexpectedly: {exc}"

    output = completed.stdout.strip()
    errors = completed.stderr.strip()
    output_size = len(completed.stdout.encode("utf-8")) + len(completed.stderr.encode("utf-8"))
    if output_size > _OUTPUT_LIMIT_BYTES:
        output = output[:5000] + "\n...[truncated]"
        errors = errors[:5000] + "\n...[truncated]"

    parts = [f"Exit code: {completed.returncode}"]
    if output:
        parts.append(f"STDOUT:\n{output}")
    if errors:
        parts.append(f"STDERR:\n{errors}")
    if not output and not errors:
        parts.append("No command output.")

    return "\n\n".join(parts)


def register() -> None:
    register_plugin("gsd", {"run": run})
