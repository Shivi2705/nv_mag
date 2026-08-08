import { useEffect, useRef, useState } from "react";

/**
 * Simulates a live stream by walking through an array of samples
 * (e.g. rows returned from a completed /api/data/collect session)
 * at a fixed cadence, appending one at a time — used to drive live
 * charts/readouts from a finished dataset as if it were streaming.
 */
export default function useRealtimeData(samples, { intervalMs = 200, running = true } = {}) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!running || !samples || samples.length === 0) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1 < samples.length ? i + 1 : i));
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, [samples, intervalMs, running]);

  const current = samples && samples.length ? samples[index] : null;
  const windowed = samples ? samples.slice(0, index + 1) : [];

  return { current, windowed, index, reset: () => setIndex(0) };
}
