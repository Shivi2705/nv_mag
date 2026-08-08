import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MagneticChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
        <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
          label={{ value: "Sample #", position: "insideBottom", offset: -3, fill: "#64748B", fontSize: 10 }} />
        <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
          label={{ value: "µT", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "#0F1524", border: "1px solid #1E293B", fontSize: 11, fontFamily: "JetBrains Mono" }} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
        <Line type="monotone" dataKey="Bx" stroke="#00F0FF" dot={false} strokeWidth={1.75} />
        <Line type="monotone" dataKey="By" stroke="#10B981" dot={false} strokeWidth={1.75} />
        <Line type="monotone" dataKey="Bz" stroke="#F59E0B" dot={false} strokeWidth={1.75} />
        <Line type="monotone" dataKey="total" stroke="#FB7185" dot={false} strokeWidth={2} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
