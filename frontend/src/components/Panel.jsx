export function Panel({ title, subtitle, icon: Icon, right, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-border bg-panel/70 backdrop-blur-sm relative overflow-hidden ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={15} className="text-cyan-glow" />}
            <div>
              <div className="text-xs font-mono-lab tracking-wide text-slate-300 uppercase">{title}</div>
              {subtitle && <div className="text-[10px] text-slate-500">{subtitle}</div>}
            </div>
          </div>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StatReadout({ label, value, unit, color = "cyan", size = "md" }) {
  const colorClass = {
    cyan: "text-cyan-glow",
    emerald: "text-emerald-glow",
    amber: "text-amber-glow",
    rose: "text-rose-glow",
    slate: "text-slate-200",
  }[color];
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div>
      <div className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className={`font-display font-semibold ${sizeClass} ${colorClass}`}>
        {value}
        {unit && <span className="text-xs ml-1 text-slate-500 font-mono-lab">{unit}</span>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "cyan" }) {
  const toneClass = {
    cyan: "bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30",
    emerald: "bg-emerald-glow/10 text-emerald-glow border-emerald-glow/30",
    amber: "bg-amber-glow/10 text-amber-glow border-amber-glow/30",
    rose: "bg-rose-glow/10 text-rose-glow border-rose-glow/30",
  }[tone];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-lab border ${toneClass}`}>
      {children}
    </span>
  );
}
