import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

const DEFAULT_LOCATION = {
  session_name: "ahmedabad_run",
  latitude: 23.0225,
  longitude: 72.5714,
  altitude_m: 53,
};

export function SessionProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [duration, setDuration] = useState(60); // minutes
  const [sampleRateHz, setSampleRateHz] = useState(1 / 60); // 1 sample/min default
  const [session, setSession] = useState(null); // { session_id, n_samples, csv_path }
  const [samples, setSamples] = useState([]); // rows fetched back for this session
  const [streaming, setStreaming] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const value = {
    location, setLocation,
    duration, setDuration,
    sampleRateHz, setSampleRateHz,
    session, setSession,
    samples, setSamples,
    streaming, setStreaming,
    elapsedSec, setElapsedSec,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
