import { Sliders } from "lucide-react";

function Slider({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 mb-1">
        <span>{label}</span>
        <span className="text-cyan-glow">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500 h-1.5 rounded-lg appearance-none bg-border cursor-pointer"
      />
    </div>
  );
}

export default function NVConfiguration({ params, setParams }) {
  const set = (k) => (v) => setParams((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] font-mono-lab text-slate-500 uppercase tracking-wider">
        <Sliders size={12} className="text-cyan-glow" /> NV Center Parameters
      </div>
      <Slider label="Zero-Field Splitting D" value={params.D} onChange={set("D")} min={2.85} max={2.89} step={0.0001} unit=" GHz" />
      <Slider label="Strain E" value={params.E} onChange={set("E")} min={0} max={0.01} step={0.0001} unit=" GHz" />
      <Slider label="Temperature" value={params.temperature} onChange={set("temperature")} min={200} max={400} step={1} unit=" K" />
      <Slider label="Laser Power" value={params.laserPower} onChange={set("laserPower")} min={0.1} max={10} step={0.1} unit=" mW" />
      <Slider label="Microwave Power" value={params.mwPower} onChange={set("mwPower")} min={-30} max={10} step={1} unit=" dBm" />
      <Slider label="Linewidth Γ" value={params.linewidth} onChange={set("linewidth")} min={1} max={15} step={0.1} unit=" MHz" />
    </div>
  );
}
