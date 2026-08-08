import { Radio, Play, Pause, MapPin, Clock } from "lucide-react";
import useBackendStatus from "../hooks/useBackendStatus";
import { useSession } from "../context/SessionContext";

function fmtElapsed(sec) {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function TopBar() {
  const connected = useBackendStatus();
  const { location, streaming, setStreaming, elapsedSec } = useSession();

  return (
    <header className="h-16 shrink-0 border-b border-border bg-panel/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Radio
            size={18}
            className={connected ? "text-emerald-glow" : connected === false ? "text-rose-glow" : "text-slate-500"}
          />
          {connected && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-glow animate-ping" />
          )}
        </div>
        <div className="font-mono-lab text-xs">
          <div className={connected ? "text-emerald-glow" : connected === false ? "text-rose-glow" : "text-slate-500"}>
            {connected === null ? "CHECKING…" : connected ? "BACKEND CONNECTED" : "BACKEND OFFLINE"}
          </div>
          <div className="text-slate-500">localhost:8000</div>
        </div>
      </div>

      <div className="flex items-center gap-6 font-mono-lab text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin size={14} className="text-cyan-glow" />
          <span>
            {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock size={14} className="text-cyan-glow" />
          <span>{fmtElapsed(elapsedSec)}</span>
        </div>
        <button
          onClick={() => setStreaming((s) => !s)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
            streaming
              ? "border-emerald-glow/50 bg-emerald-glow/10 text-emerald-glow shadow-glow-emerald"
              : "border-cyan-glow/40 bg-cyan-glow/5 text-cyan-glow hover:bg-cyan-glow/10"
          }`}
        >
          {streaming ? <Pause size={14} /> : <Play size={14} />}
          {streaming ? "PAUSE STREAM" : "START STREAM"}
        </button>
      </div>
    </header>
  );
}
