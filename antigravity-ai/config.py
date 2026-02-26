"""Configuration and plugin registry for Antigravity extension tools."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Mapping

ToolHandler = Callable[..., Any]

DEFAULT_PLUGINS = ("gsd", "graph", "coderabbit")


def _parse_plugin_list(raw: str | None) -> list[str]:
    if raw is None or not raw.strip():
        return list(DEFAULT_PLUGINS)
    return [name.strip().lower() for name in raw.split(",") if name.strip()]


PLUGINS_LIST: list[str] = _parse_plugin_list(os.getenv("ANTIGRAVITY_PLUGINS"))


def _resolve_target_project() -> Path:
    configured = os.getenv("ANTIGRAVITY_TARGET_PROJECT")
    if configured:
        candidate = Path(configured).expanduser()
    else:
        candidate = Path(__file__).resolve().parent / "target_project"

    if not candidate.is_absolute():
        candidate = (Path(__file__).resolve().parent / candidate).resolve()

    if candidate.exists():
        return candidate.resolve()

    # Fallback: treat the parent of antigravity-ai as repository root.
    return Path(__file__).resolve().parent.parent


TARGET_PROJECT: Path = _resolve_target_project()

_PLUGIN_TOOLS: Dict[str, Dict[str, ToolHandler]] = {}


def register_plugin(plugin_name: str, tools: Mapping[str, ToolHandler]) -> None:
    """Register a plugin and the actions it exposes."""
    normalized_name = plugin_name.strip().lower()
    if not normalized_name:
        raise ValueError("plugin_name cannot be empty")
    if not tools:
        raise ValueError(f"Plugin '{normalized_name}' must expose at least one tool.")

    validated_tools: Dict[str, ToolHandler] = {}
    for action, handler in tools.items():
        action_name = action.strip().lower()
        if not action_name:
            raise ValueError(f"Plugin '{normalized_name}' has an empty action name.")
        if not callable(handler):
            raise TypeError(
                f"Plugin '{normalized_name}' action '{action_name}' is not callable."
            )
        validated_tools[action_name] = handler

    _PLUGIN_TOOLS[normalized_name] = validated_tools


def get_tool(plugin_name: str, action: str) -> ToolHandler:
    """Fetch a registered plugin action."""
    normalized_plugin = plugin_name.strip().lower()
    normalized_action = action.strip().lower()

    if normalized_plugin not in _PLUGIN_TOOLS:
        available = ", ".join(sorted(_PLUGIN_TOOLS.keys())) or "none"
        raise KeyError(
            f"Plugin '{plugin_name}' is not registered. Available plugins: {available}."
        )

    plugin_tools = _PLUGIN_TOOLS[normalized_plugin]
    if normalized_action not in plugin_tools:
        available = ", ".join(sorted(plugin_tools.keys()))
        raise KeyError(
            f"Action '{action}' not found in plugin '{plugin_name}'. "
            f"Available actions: {available}."
        )

    return plugin_tools[normalized_action]


def iter_registered_tools() -> Iterable[tuple[str, str]]:
    """Yield (plugin, action) for every registered tool."""
    for plugin_name in sorted(_PLUGIN_TOOLS.keys()):
        for action_name in sorted(_PLUGIN_TOOLS[plugin_name].keys()):
            yield plugin_name, action_name


def get_available_tools() -> str:
    """Human-readable summary of registered tools."""
    if not _PLUGIN_TOOLS:
        return "No tools registered."
    lines = ["Registered tools:"]
    for plugin_name in sorted(_PLUGIN_TOOLS.keys()):
        actions = ", ".join(sorted(_PLUGIN_TOOLS[plugin_name].keys()))
        lines.append(f"  - {plugin_name}: {actions}")
    return "\n".join(lines)
