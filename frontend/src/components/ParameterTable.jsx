export default function ParameterTable({ rows }) {
  return (
    <div className="overflow-auto max-h-72 rounded border border-border">
      <table className="w-full text-[11px] font-mono-lab">
        <thead className="sticky top-0 bg-panel2 text-slate-500 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="text-left px-3 py-2 font-medium">#</th>
            <th className="text-left px-3 py-2 font-medium">Timestamp</th>
            <th className="text-right px-3 py-2 font-medium">Bx (µT)</th>
            <th className="text-right px-3 py-2 font-medium">By (µT)</th>
            <th className="text-right px-3 py-2 font-medium">Bz (µT)</th>
            <th className="text-right px-3 py-2 font-medium">|B| (µT)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/60 hover:bg-white/[0.03]">
              <td className="px-3 py-1.5 text-slate-600">{i + 1}</td>
              <td className="px-3 py-1.5 text-slate-400">{r.timestamp}</td>
              <td className="px-3 py-1.5 text-right text-cyan-glow">{Number(r.Bx_uT ?? r.Bx).toFixed(3)}</td>
              <td className="px-3 py-1.5 text-right text-emerald-glow">{Number(r.By_uT ?? r.By).toFixed(3)}</td>
              <td className="px-3 py-1.5 text-right text-amber-glow">{Number(r.Bz_uT ?? r.Bz).toFixed(3)}</td>
              <td className="px-3 py-1.5 text-right text-slate-200">{Number(r.B_total_uT ?? r.total).toFixed(3)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-600">No data yet — run a collection session.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
