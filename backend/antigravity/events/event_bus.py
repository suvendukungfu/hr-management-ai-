from __future__ import annotations

# Backward-compatible shim:
# existing modules import `antigravity.events.event_bus.event_bus`.
# The runtime now uses the typed EventBus implementation in `runtime.event_bus`.
from antigravity.runtime.event_bus import EventBus, event_bus

__all__ = ["EventBus", "event_bus"]
