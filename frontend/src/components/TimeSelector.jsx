import { Clock, Zap } from "lucide-react";
import { useSession } from "../context/SessionContext";

const RATE_PRESETS = [
  { label: "1 Hz (1/sec)", hz: 1 },
  { label: "1/min", hz: 1 / 60 },
  { label: "0.1 Hz", hz: 0.1 },
];

export default function TimeSelector() {
  const { duration, setDuration, sampleRateHz, setSampleRateHz } = useSession();

  const intervalS = Math.max(1, Math.round(1 / sampleRateHz));
  const totalSamples = Math.floor((duration * 60) / intervalS);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
          <Clock size={11} /> Duration (minutes)
        </label>
        <input
          type="number" min="1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full bg-void border border-border rounded px-3 py-2 text-sm font-mono-lab text-slate-200 focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/30"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
          <Zap size={11} /> Sample Rate
        </label>
        <div className="flex gap-2">
          {RATE_PRESETS.map((r) => (
            <button
              key={r.label}
              onClick={() => setSampleRateHz(r.hz)}
              className={`flex-1 text-[11px] font-mono-lab px-2 py-2 rounded border transition-colors ${
                sampleRateHz === r.hz
                  ? "border-cyan-glow/50 bg-cyan-glow/10 text-cyan-glow"
                  : "border-border text-slate-400 hover:border-cyan-glow/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded border border-border bg-void/60 px-3 py-2 font-mono-lab text-[11px] text-slate-400 flex justify-between">
        <span>Interval: <span className="text-cyan-glow">{intervalS}s</span></span>
        <span>Total samples: <span className="text-cyan-glow">{totalSamples.toLocaleString()}</span></span>
      </div>
    </div>
  );
}
