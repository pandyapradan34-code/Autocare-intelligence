import ServiceRecord from "../models/ServiceRecord.js";
import HealthScore from "../models/HealthScore.js";

// GET /api/vehicles/:vehicleId/analytics
export const getAnalytics = async (req, res) => {
  const vehicleId = req.vehicle._id;
  const services = await ServiceRecord.find({ vehicleId }).sort("serviceDate");

  const totalCost = services.reduce((s, r) => s + (r.cost || 0), 0);

  const byType = {};
  const byYear = {};
  services.forEach((s) => {
    byType[s.serviceType] = (byType[s.serviceType] || 0) + (s.cost || 0);
    const y = new Date(s.serviceDate).getFullYear();
    byYear[y] = (byYear[y] || 0) + (s.cost || 0);
  });

  const mileageTrend = services.map((s) => ({
    date: new Date(s.serviceDate).toISOString().slice(0, 10),
    odometer: s.odometer,
  }));

  let avgGapDays = null;
  if (services.length > 1) {
    const span = new Date(services.at(-1).serviceDate) - new Date(services[0].serviceDate);
    avgGapDays = Math.round(span / 86400000 / (services.length - 1));
  }

  const healthTrend = await HealthScore.find({ vehicleId }).sort("date").select("date score -_id");

  res.json({
    totalCost,
    serviceCount: services.length,
    avgGapDays,
    costByType: Object.entries(byType).map(([name, cost]) => ({ name, cost })),
    yearlyCost: Object.entries(byYear).map(([year, cost]) => ({ year, cost })),
    mileageTrend,
    healthTrend,
  });
};