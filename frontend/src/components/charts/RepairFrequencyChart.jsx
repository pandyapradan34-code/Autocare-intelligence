import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useChartAnimationKey, prefersReducedMotion } from "../../utils/motion";

const COLORS = ["#3b82f6", "#f97316", "#dc2626", "#eab308", "#16a34a", "#8b5cf6"];

export default function RepairFrequencyChart({ data }) {
  const animKey = useChartAnimationKey();
  const isReduced = prefersReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {animKey > 0 ? (
        <BarChart key={animKey} data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            dataKey="category"
            type="category"
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            formatter={(value) => [`${value} repairs`, "Frequency"]}
            cursor={{ fill: "rgba(241,245,249,0.8)" }}
          />
          <Bar
            dataKey="count"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
            isAnimationActive={!isReduced}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <div className="h-full w-full" />
      )}
    </ResponsiveContainer>
  );
}

