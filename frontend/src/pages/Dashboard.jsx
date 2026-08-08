import { useEffect, useState } from "react";
import { Activity, Crosshair, Waves, ShieldAlert } from "lucide-react";
import { Panel, StatReadout, Badge } from "../components/Panel";
import Vector3D from "../components/Vector3D";
import MagneticChart from "../components/MagneticChart";
import { useSession } from "../context/SessionContext";

export default function Dashboard() {
  const { session, samples, location } = useSession();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (samples && samples.length) {
      setHistory(
        samples.slice(-120).map((s, i) => ({
          t: i,
          Bx: Number(s.Bx_uT ?? s.true_Bx_uT ?? 0),
          By: Number(s.By_uT ?? s.true_By_uT ?? 0),
          Bz: Number(s.Bz_uT ?? s.true_Bz_uT ?? 0),
          total: Number(s.B_total_uT ?? 0),
        }))
      );
    }
  }, [samples]);

  const latest = samples && samples.length ? samples[samples.length - 1] : null;
  const positionError = latest ? Number(latest.B_reconstruction_error_uT ?? 0) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-100">System Overview</h1>
          <p className="text-xs text-slate-500 font-mono-lab mt-0.5">
            4-axis NV vector magnetometry · {location.session_name}
          </p>
        </div>
        {session ? (
          <Badge tone="emerald">SESSION #{session.session_id} · {session.n_samples} SAMPLES</Badge>
        ) : (
          <Badge tone="amber">NO ACTIVE SESSION</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Live Magnetic Vector" icon={Activity} className="lg:col-span-2">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatReadout label="Bx" value={latest ? Number(latest.Bx_uT).toFixed(3) : "—"} unit="µT" color="cyan" />
            <StatReadout label="By" value={latest ? Number(latest.By_uT).toFixed(3) : "—"} unit="µT" color="emerald" />
            <StatReadout label="Bz" value={latest ? Number(latest.Bz_uT).toFixed(3) : "—"} unit="µT" color="amber" />
            <StatReadout label="|B|" value={latest ? Number(latest.B_total_uT).toFixed(3) : "—"} unit="µT" color="slate" size="lg" />
          </div>
          {history.length > 1 ? (
            <MagneticChart data={history} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm font-mono-lab border border-dashed border-border rounded">
              Run a Data Collection session to populate the live readout
            </div>
          )}
        </Panel>

        <Panel title="Reconstructed Field Vector" icon={Crosshair}>
          <div className="h-64">
            <Vector3D B_uT={latest ? [Number(latest.Bx_uT), Number(latest.By_uT), Number(latest.Bz_uT)] : [0, 0, 0]} />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Position Accuracy" icon={ShieldAlert}>
          <StatReadout
            label="Reconstruction Error"
            value={positionError !== null ? positionError.toFixed(2) : "—"}
            unit="µT"
            color={positionError !== null && positionError > 10 ? "rose" : "emerald"}
            size="lg"
          />
          {positionError !== null && positionError > 10 && (
            <p className="text-[11px] text-rose-glow/80 font-mono-lab mt-2 leading-relaxed">
              High error — Earth-field Zeeman splitting is likely sub-linewidth. Apply a DC bias field for reliable reconstruction.
            </p>
          )}
        </Panel>

        <Panel title="Session Config" icon={Waves}>
          <div className="space-y-1.5 font-mono-lab text-xs text-slate-400">
            <div className="flex justify-between"><span>Location</span><span className="text-slate-200">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span></div>
            <div className="flex justify-between"><span>Altitude</span><span className="text-slate-200">{location.altitude_m} m</span></div>
            <div className="flex justify-between"><span>Samples</span><span className="text-slate-200">{samples.length}</span></div>
          </div>
        </Panel>

        <Panel title="Quick Control">
          <div className="text-xs font-mono-lab text-slate-500 leading-relaxed">
            Configure location, duration and sample rate on the{" "}
            <a href="/data-collection" className="text-cyan-glow hover:underline">Data Collection</a> page,
            then start a 60-minute recording against the FastAPI backend.
          </div>
        </Panel>
      </div>
    </div>
  );
}
