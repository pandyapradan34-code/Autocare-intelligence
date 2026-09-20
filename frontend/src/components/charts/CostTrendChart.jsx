import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useChartAnimationKey, prefersReducedMotion } from "../../utils/motion";

const BAR_COLOR = "#f97316";

export default function CostTrendChart({ data }) {
  const animKey = useChartAnimationKey();
  const isReduced = prefersReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {animKey > 0 ? (
        <BarChart key={animKey} data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Cost"]}
            cursor={{ fill: "rgba(241,245,249,0.8)" }}
          />
          <Bar
            dataKey="cost"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
            isAnimationActive={!isReduced}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <div className="h-full w-full" />
      )}
    </ResponsiveContainer>
  );
}

