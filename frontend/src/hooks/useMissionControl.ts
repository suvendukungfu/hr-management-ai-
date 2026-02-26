import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws/events';

export function useMissionControl() {
  const [systemState, setSystemState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [simResults, setSimResults] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/state`);
      const data = await res.json();
      setSystemState(data);
    } catch (err) {
      console.error("Failed to fetch state", err);
    }
  };

  useEffect(() => {
    // Call fetchState asynchronously to avoid the synchronous setState warning
    setTimeout(() => {
      fetchState();
    }, 0);
    const interval = setInterval(fetchState, 3000);

    const connectWs = () => {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onmessage = (event: MessageEvent) => {
        const evData = JSON.parse(event.data);
        setEvents(prev => [...prev, evData]);
        
        if (evData.topic === 'simulation:complete') {
          setSimResults(evData.data);
        }
        
        if (evData.topic.startsWith('planner:')) {
          fetchState();
        }
      };
      
      wsRef.current.onclose = () => {
        setTimeout(connectWs, 2000);
      };
    };
    
    connectWs();

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const triggerApi = async (path: string, body: any = null) => {
    const opts: RequestInit = { method: 'POST' };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    await fetch(`${API_BASE}${path}`, opts);
    fetchState();
  };

  return {
    systemState,
    events,
    simResults,
    triggerApi,
    refreshState: fetchState
  };
}
