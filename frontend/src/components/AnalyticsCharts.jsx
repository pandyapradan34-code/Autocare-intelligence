import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import useApi from "../hooks/useApi";

export default function AnalyticsCharts({ vehicleId }) {
  const api = useApi();
  const [a, setA] = useState(null);

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}/analytics`).then((res) => setA(res.data));
  }, [api, vehicleId]);

  if (!a) return null;

  return (
    <div className="space-y-8">
      <p>Total cost: ₹{a.totalCost} | Services: {a.serviceCount} | Avg gap: {a.avgGapDays ?? "-"} din</p>

      <h3>Health Score Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={a.healthTrend}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip />
          <Line type="monotone" dataKey="score" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Yearly Cost</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={a.yearlyCost}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip />
          <Bar dataKey="cost" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Cost by Service Type</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={a.costByType}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
          <Bar dataKey="cost" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Mileage Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={a.mileageTrend}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip />
          <Line type="monotone" dataKey="odometer" stroke="#9333ea" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}