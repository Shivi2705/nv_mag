import { useMemo, useState } from "react";
import { Navigation as NavIcon, Route, Radar } from "lucide-react";
import { Panel, StatReadout } from "../components/Panel";
import PositionMap from "../components/PositionMap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSession } from "../context/SessionContext";

export default function Navigation() {
  const { location, samples } = useSession();
  const [running, setRunning] = useState(false);

  const ground = [location.latitude, location.longitude];

  // Simulated EKF track: small correlated random walk around ground truth,
  // seeded from actual reconstruction error where available.
  const track = useMemo(() => {
    const pts = [];
    let lat = location.latitude, lon = location.longitude;
    const n = samples.length ? Math.min(samples.length, 60) : 40;
    for (let i = 0; i < n; i++) {
      const errUt = samples[i]?.B_reconstruction_error_uT ? Number(samples[i].B_reconstruction_error_uT) : 5;
      const scale = Math.min(errUt, 50) / 50; // 0..1
      lat += (Math.random() - 0.5) * 0.00006 * (0.3 + scale);
      lon += (Math.random() - 0.5) * 0.00006 * (0.3 + scale);
      pts.push([lat, lon]);
    }
    return pts;
  }, [samples, location]);

  const residuals = useMemo(
    () => track.map((p, i) => ({
      k: i,
      residual_m: Math.hypot(p[0] - ground[0], p[1] - ground[1]) * 111000,
    })),
    [track]
  );

  const lastResidual = residuals.length ? residuals[residuals.length - 1].residual_m : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-100">Quantum Navigation</h1>
          <p className="text-xs text-slate-500 font-mono-lab mt-0.5">
            Map-matched position estimate vs ground truth · EKF residual tracking
          </p>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          className={`text-[11px] font-mono-lab px-3 py-1.5 rounded border ${
            running ? "border-emerald-glow/50 text-emerald-glow bg-emerald-glow/10" : "border-border text-slate-400 hover:border-cyan-glow/40"
          }`}
        >
          {running ? "TRACKING…" : "SIMULATE TRACK"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Position Map" icon={NavIcon} className="lg:col-span-2">
          <div className="h-96">
            <PositionMap center={ground} groundTruth={ground} estimatedTrack={track} errorRadiusM={Math.max(8, lastResidual || 20)} />
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Position Estimate" icon={Radar}>
            <StatReadout
              label="EKF Residual"
              value={lastResidual !== null ? lastResidual.toFixed(1) : "—"}
              unit="m"
              color={lastResidual > 30 ? "rose" : "emerald"}
              size="lg"
            />
            <p className="text-[10px] font-mono-lab text-slate-600 mt-2 leading-relaxed">
              navigation/ekf.py is not yet implemented server-side — this residual is a client-side
              placeholder driven by the session's reconstruction error, for UI development only.
            </p>
          </Panel>
          <Panel title="Session" icon={Route}>
            <div className="space-y-1.5 font-mono-lab text-xs text-slate-400">
              <div className="flex justify-between"><span>Ground truth</span><span className="text-slate-200">{ground[0].toFixed(5)}, {ground[1].toFixed(5)}</span></div>
              <div className="flex justify-between"><span>Track points</span><span className="text-slate-200">{track.length}</span></div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="EKF Residual Over Time">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={residuals} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
            <XAxis dataKey="k" stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
              label={{ value: "meters", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0F1524", border: "1px solid #1E293B", fontSize: 11, fontFamily: "JetBrains Mono" }} />
            <Line type="monotone" dataKey="residual_m" stroke="#FB7185" dot={false} strokeWidth={1.75} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
