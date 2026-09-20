import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartAnimationKey, prefersReducedMotion } from "../../utils/motion";

const SERIES = [
  { key: "engine", label: "Engine", color: "#3b82f6" },
  { key: "brakes", label: "Brakes", color: "#f97316" },
  { key: "suspension", label: "Suspension", color: "#dc2626" },
  { key: "tyres", label: "Tyres", color: "#16a34a" },
];

export default function ComponentDegradationChart({ data }) {
  const animKey = useChartAnimationKey();
  const isReduced = prefersReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {animKey > 0 ? (
        <LineChart key={animKey} data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          {SERIES.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={!isReduced}
              animationDuration={800 + i * 200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      ) : (
        <div className="h-full w-full" />
      )}
    </ResponsiveContainer>
  );
}

