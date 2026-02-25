import asyncio
import json
from typing import List, Callable, Any, Dict
from fastapi import WebSocket

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.websockets: List[WebSocket] = []
        self.history: List[Dict[str, Any]] = []

    def subscribe(self, topic: str, callback: Callable):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)

    async def connect_websocket(self, websocket: WebSocket):
        await websocket.accept()
        self.websockets.append(websocket)
        # Send history upon connection
        for event in self.history:
            await websocket.send_text(json.dumps(event))

    def disconnect_websocket(self, websocket: WebSocket):
        if websocket in self.websockets:
            self.websockets.remove(websocket)

    async def publish(self, topic: str, data: Any):
        event = {"topic": topic, "data": data}
        self.history.append(event)
        
        # Trigger internal callbacks
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                if asyncio.iscoroutinefunction(callback):
                    asyncio.create_task(callback(data))
                else:
                    callback(data)

        # Broadcast to all connected websockets
        message = json.dumps(event)
        dead_sockets = []
        for ws in self.websockets:
            try:
                await ws.send_text(message)
            except Exception:
                dead_sockets.append(ws)
                
        for ws in dead_sockets:
            self.disconnect_websocket(ws)

# Singleton Event Bus
event_bus = EventBus()
