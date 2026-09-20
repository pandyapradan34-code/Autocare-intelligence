import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartAnimationKey, prefersReducedMotion } from "../../utils/motion";

export default function MileageTrendChart({ data }) {
  const animKey = useChartAnimationKey();
  const isReduced = prefersReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {animKey > 0 ? (
        <LineChart key={animKey} data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            formatter={(value) => [`${value.toLocaleString("en-IN")} km`, "Odometer"]}
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="km"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={!isReduced}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </LineChart>
      ) : (
        <div className="h-full w-full" />
      )}
    </ResponsiveContainer>
  );
}

