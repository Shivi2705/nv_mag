import { MapPin } from "lucide-react";
import { useSession } from "../context/SessionContext";

const PRESETS = [
  { label: "Ahmedabad, IN", lat: 23.0225, lon: 72.5714, alt: 53 },
  { label: "Bengaluru, IN", lat: 12.9716, lon: 77.5946, alt: 920 },
  { label: "Reykjavik, IS", lat: 64.1466, lon: -21.9426, alt: 61 },
  { label: "Singapore, SG", lat: 1.3521, lon: 103.8198, alt: 15 },
];

export default function LocationSelector() {
  const { location, setLocation } = useSession();

  const update = (field) => (e) => {
    const val = field === "session_name" ? e.target.value : Number(e.target.value);
    setLocation((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() =>
              setLocation((prev) => ({ ...prev, latitude: p.lat, longitude: p.lon, altitude_m: p.alt }))
            }
            className="text-[11px] font-mono-lab px-2.5 py-1 rounded border border-border text-slate-400 hover:border-cyan-glow/40 hover:text-cyan-glow transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 block mb-1">
          Session Name
        </label>
        <input
          value={location.session_name}
          onChange={update("session_name")}
          className="w-full bg-void border border-border rounded px-3 py-2 text-sm font-mono-lab text-slate-200 focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/30"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 block mb-1">
            Latitude
          </label>
          <input
            type="number" step="0.0001"
            value={location.latitude}
            onChange={update("latitude")}
            className="w-full bg-void border border-border rounded px-3 py-2 text-sm font-mono-lab text-slate-200 focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/30"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 block mb-1">
            Longitude
          </label>
          <input
            type="number" step="0.0001"
            value={location.longitude}
            onChange={update("longitude")}
            className="w-full bg-void border border-border rounded px-3 py-2 text-sm font-mono-lab text-slate-200 focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/30"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono-lab uppercase tracking-wider text-slate-500 block mb-1">
            Altitude (m)
          </label>
          <input
            type="number" step="1"
            value={location.altitude_m}
            onChange={update("altitude_m")}
            className="w-full bg-void border border-border rounded px-3 py-2 text-sm font-mono-lab text-slate-200 focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono-lab text-slate-500">
        <MapPin size={12} className="text-cyan-glow" />
        {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° · {location.altitude_m} m
      </div>
    </div>
  );
}
