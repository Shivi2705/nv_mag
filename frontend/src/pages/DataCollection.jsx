import { useState } from "react";
import { PlayCircle, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Panel, Badge } from "../components/Panel";
import LocationSelector from "../components/LocationSelector";
import TimeSelector from "../components/TimeSelector";
import ParameterTable from "../components/ParameterTable";
import { useSession } from "../context/SessionContext";
import { collectSession, getSession } from "../services/api";

export default function DataCollection() {
  const { location, duration, sampleRateHz, session, setSession, samples, setSamples } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalS = Math.max(1, Math.round(1 / sampleRateHz));

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        session_name: location.session_name,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude_m: location.altitude_m,
        duration_min: duration,
        sample_interval_s: intervalS,
      };
      const res = await collectSession(payload);
      setSession(res);
      // fetch back the samples for this session for the table/dashboard
      try {
        const detail = await getSession(res.session_id);
        setSamples(detail.samples?.map((s) => ({ timestamp: s.timestamp, ...s.vector_result })) || []);
      } catch {
        setSamples([]);
      }
    } catch (e) {
      setError(e?.message || "Request failed — is the backend running at localhost:8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-100">Data Collection</h1>
          <p className="text-xs text-slate-500 font-mono-lab mt-0.5">
            POST /api/data/collect · real-time physics simulation per sample
          </p>
        </div>
        {session && <Badge tone="emerald">SESSION #{session.session_id}</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Location">
          <LocationSelector />
        </Panel>
        <Panel title="Time & Rate">
          <TimeSelector />
        </Panel>
        <Panel title="Recording">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-mono-lab leading-relaxed">
              {duration} min at {intervalS}s/sample → {Math.floor((duration * 60) / intervalS).toLocaleString()} samples.
              A 3600-sample (1 Hz, 60 min) run takes roughly 1–2 minutes server-side.
            </p>
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded border border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow font-mono-lab text-sm hover:bg-cyan-glow/20 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
              {loading ? "COLLECTING…" : `START ${duration}-MIN RECORDING`}
            </button>
            {error && (
              <div className="flex items-start gap-2 text-[11px] text-rose-glow font-mono-lab bg-rose-glow/5 border border-rose-glow/20 rounded px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {session && !error && (
              <div className="flex items-start gap-2 text-[11px] text-emerald-glow font-mono-lab bg-emerald-glow/5 border border-emerald-glow/20 rounded px-3 py-2">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                Saved {session.n_samples} samples → {session.csv_path}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Streamed Samples" subtitle={`${samples.length} rows loaded`}>
        <ParameterTable rows={samples} />
      </Panel>
    </div>
  );
}
