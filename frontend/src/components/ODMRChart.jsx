import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { NV_AXES, transitionFreqs, odmrSpectrum } from "../lib/nvPhysics";

export default function ODMRChart({ B_uT, params }) {
  const fStart = 2.75, fStop = 2.99, points = 300;
  const grid = Array.from({ length: points }, (_, i) => fStart + ((fStop - fStart) * i) / (points - 1));

  const perAxis = NV_AXES.map((axis) => {
    const { fMinus, fPlus } = transitionFreqs(B_uT, axis, params.D, params.E, 28.024);
    const spectrum = odmrSpectrum(fMinus, fPlus, {
      linewidthMHz: params.linewidth,
      contrastPct: 6 + params.laserPower * 1.2,
      points,
      fStart,
      fStop,
    });
    return { axis, fMinus, fPlus, spectrum };
  });

  const merged = grid.map((f, i) => {
    const row = { f: Number(f.toFixed(4)) };
    perAxis.forEach(({ axis, spectrum }) => {
      row[axis.id] = spectrum[i].pl;
    });
    return row;
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={merged} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
          <XAxis
            dataKey="f" stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
            label={{ value: "MW Frequency (GHz)", position: "insideBottom", offset: -3, fill: "#64748B", fontSize: 10 }}
          />
          <YAxis
            stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} domain={[0.75, 1.02]}
            label={{ value: "PL (norm.)", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ background: "#0F1524", border: "1px solid #1E293B", fontSize: 11, fontFamily: "JetBrains Mono" }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
          {perAxis.map(({ axis }) => (
            <Line key={axis.id} type="monotone" dataKey={axis.id} stroke={axis.color} dot={false} strokeWidth={1.75} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
        {perAxis.map(({ axis, fMinus, fPlus }) => (
          <div key={axis.id} className="rounded border border-border bg-void/60 px-2.5 py-2 font-mono-lab text-[10px]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ background: axis.color }} />
              <span className="text-slate-400">{axis.id}</span>
            </div>
            <div className="text-slate-300">f₋ {fMinus.toFixed(4)}</div>
            <div className="text-slate-300">f₊ {fPlus.toFixed(4)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
