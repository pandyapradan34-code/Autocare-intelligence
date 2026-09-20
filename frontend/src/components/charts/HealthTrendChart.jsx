import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartAnimationKey, prefersReducedMotion } from "../../utils/motion";

export default function HealthTrendChart({ data }) {
  const animKey = useChartAnimationKey();
  const isReduced = prefersReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {animKey > 0 ? (
        <AreaChart key={animKey} data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            formatter={(value) => [`${value} / 100`, "Health Score"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#healthGradient)"
            dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={!isReduced}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      ) : (
        <div className="h-full w-full" />
      )}
    </ResponsiveContainer>
  );
}

