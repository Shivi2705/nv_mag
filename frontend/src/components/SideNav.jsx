import { NavLink } from "react-router-dom";
import { LayoutDashboard, Database, Atom, Compass, Navigation as NavIcon, Hexagon } from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/data-collection", label: "Data Collection", icon: Database },
  { to: "/simulation", label: "NV Physics Sim", icon: Atom },
  { to: "/vector-magnetometry", label: "Vector Magnetometry", icon: Compass },
  { to: "/navigation", label: "Quantum Navigation", icon: NavIcon },
];

export default function SideNav() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-panel/60 flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <Hexagon className="text-cyan-glow" size={22} strokeWidth={1.5} />
        <div className="font-display font-semibold text-sm leading-tight">
          NV·QNAV
          <div className="text-[10px] font-mono-lab text-slate-500 font-normal">CONTROL CENTER</div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all border ${
                isActive
                  ? "bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 shadow-glow"
                  : "text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200"
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border font-mono-lab text-[10px] text-slate-600 leading-relaxed">
        NV-CENTER MAGNETOMETRY<br />
        4-AXIS ⟨111⟩ RECONSTRUCTION<br />
        v0.1.0-alpha
      </div>
    </aside>
  );
}
