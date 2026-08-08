import { useMemo, useState } from "react";
import { Compass, Boxes, Sigma } from "lucide-react";
import { Panel, StatReadout } from "../components/Panel";
import Vector3D from "../components/Vector3D";
import { NV_AXES, reconstructVector, dot } from "../lib/nvPhysics";

export default function VectorMagnetometry() {
  const [B_true, setB_true] = useState([15, 8, 42]);
  const [showBias, setShowBias] = useState(false);
  const [sigma, setSigma] = useState(0.35); // fit noise, MHz-equivalent sensitivity proxy

  const projections = useMemo(
    () => NV_AXES.map((axis) => ({ axis, Bpar: dot(B_true, axis.vec) })),
    [B_true]
  );

  const reconstructed = useMemo(() => {
    const bPar = projections.map((p) => p.Bpar + (Math.random() - 0.5) * sigma);
    return reconstructVector(bPar);
  }, [projections, sigma]);

  const setComp = (i) => (e) => {
    const v = Number(e.target.value);
    setB_true((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Vector Magnetometry</h1>
        <p className="text-xs text-slate-500 font-mono-lab mt-0.5">
          Projection onto 4 NV axes → pseudoinverse reconstruction b = N·B
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="True Field Input" icon={Compass}>
          <div className="space-y-3">
            {["Bx", "By", "Bz"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] font-mono-lab text-slate-500 w-6">{label}</span>
                <input type="range" min={-60} max={60} step={0.5} value={B_true[i]} onChange={setComp(i)} className="flex-1 accent-cyan-500 h-1.5" />
                <span className="text-[11px] font-mono-lab text-cyan-glow w-14 text-right">{B_true[i].toFixed(1)} µT</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-mono-lab text-slate-500 w-16">Noise σ</span>
              <input type="range" min={0} max={5} step={0.05} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} className="flex-1 accent-rose-400 h-1.5" />
              <span className="text-[11px] font-mono-lab text-rose-glow w-14 text-right">{sigma.toFixed(2)}</span>
            </div>
            <label className="flex items-center gap-2 text-[11px] font-mono-lab text-slate-400 pt-2">
              <input type="checkbox" checked={showBias} onChange={(e) => setShowBias(e.target.checked)} className="accent-amber-500" />
              Show bias field overlay
            </label>
          </div>
        </Panel>

        <Panel title="3D Vector Visualizer" icon={Boxes} className="lg:col-span-2">
          <div className="h-72">
            <Vector3D B_uT={[reconstructed.Bx, reconstructed.By, reconstructed.Bz]} showBias={showBias} />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Per-Axis Projections" icon={Sigma}>
          <div className="space-y-2">
            {projections.map(({ axis, Bpar }) => (
              <div key={axis.id} className="flex items-center justify-between font-mono-lab text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="h-2 w-2 rounded-full" style={{ background: axis.color }} />
                  {axis.id} · [{axis.vec.map((v) => v.toFixed(2)).join(", ")}]
                </span>
                <span className="text-slate-200">{Bpar.toFixed(3)} µT</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Reconstructed Vector">
          <div className="grid grid-cols-2 gap-4">
            <StatReadout label="Bx" value={reconstructed.Bx.toFixed(3)} unit="µT" color="cyan" />
            <StatReadout label="By" value={reconstructed.By.toFixed(3)} unit="µT" color="emerald" />
            <StatReadout label="Bz" value={reconstructed.Bz.toFixed(3)} unit="µT" color="amber" />
            <StatReadout label="|B|" value={reconstructed.total.toFixed(3)} unit="µT" color="slate" />
            <StatReadout label="θ (polar)" value={reconstructed.theta.toFixed(1)} unit="°" color="slate" size="sm" />
            <StatReadout label="φ (azimuth)" value={reconstructed.phi.toFixed(1)} unit="°" color="slate" size="sm" />
          </div>
          <p className="text-[10px] font-mono-lab text-slate-600 mt-3 leading-relaxed">
            Uncertainty grows with σ — this mirrors Σ_B = N⁺ Σ_b (N⁺)ᵀ propagation; a true covariance ellipsoid render can be added once /api/magnetometry/reconstruct returns Σ_B from the backend.
          </p>
        </Panel>
      </div>
    </div>
  );
}
