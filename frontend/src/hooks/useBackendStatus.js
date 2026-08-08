import { useEffect, useState } from "react";
import { checkHealth } from "../services/api";

export default function useBackendStatus(pollMs = 8000) {
  const [connected, setConnected] = useState(null); // null = checking

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        await checkHealth();
        if (alive) setConnected(true);
      } catch {
        if (alive) setConnected(false);
      }
    };
    ping();
    const id = setInterval(ping, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollMs]);

  return connected;
}
