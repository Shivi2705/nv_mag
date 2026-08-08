import { useState } from "react";
import { Atom, Waves } from "lucide-react";
import { Panel } from "../components/Panel";
import NVConfiguration from "../components/NVConfiguration";
import ODMRChart from "../components/ODMRChart";
import Vector3D from "../components/Vector3D";

export default function NVSimulation() {
  const [params, setParams] = useState({
    D: 2.87, E: 0.0032, temperature: 300, laserPower: 2.5, mwPower: -10, linewidth: 6,
  });
  const [B_uT, setB_uT] = useState([15, 8, 42]);

  const setComp = (i) => (e) => {
    const v = Number(e.target.value);
    setB_uT((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-slate-100">NV Physics Simulation</h1>
        <p className="text-xs text-slate-500 font-mono-lab mt-0.5">
          4-axis ⟨111⟩ tetrahedral orientations · ODMR resonance model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Configuration" icon={Atom}>
          <NVConfiguration params={params} setParams={setParams} />
          <div className="mt-5 pt-4 border-t border-border space-y-3">
            <div className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500">Test Field (µT)</div>
            {["Bx", "By", "Bz"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] font-mono-lab text-slate-500 w-6">{label}</span>
                <input
                  type="range" min={-60} max={60} step={0.5} value={B_uT[i]} onChange={setComp(i)}
                  className="flex-1 accent-cyan-500 h-1.5"
                />
                <span className="text-[11px] font-mono-lab text-cyan-glow w-14 text-right">{B_uT[i].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Diamond Lattice · ⟨111⟩ Axes" icon={Atom} className="lg:col-span-2">
          <div className="h-80">
            <Vector3D B_uT={B_uT} />
          </div>
        </Panel>
      </div>

      <Panel title="ODMR Spectrum · Multi-Dip Resonance" icon={Waves}>
        <ODMRChart B_uT={B_uT} params={params} />
      </Panel>
    </div>
  );
}
