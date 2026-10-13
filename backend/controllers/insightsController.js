import ServiceRecord from "../models/ServiceRecord.js";
import Inspection from "../models/Inspection.js";
import HealthScore from "../models/HealthScore.js";
import { calculateHealth, getComponentHealth, getNextService, getRecommendations } from "../utils/healthEngine.js";

// GET /api/vehicles/:vehicleId/insights
export const getInsights = async (req, res) => {
  const vehicle = req.vehicle;

  const [services, inspections] = await Promise.all([
    ServiceRecord.find({ vehicleId: vehicle._id }).sort("-serviceDate"),
    Inspection.find({ vehicleId: vehicle._id }).sort("-inspectionDate").limit(5),
  ]);

  const lastService = services[0] || null;
  const latestInspection = inspections[0] || null;

  const health = calculateHealth(vehicle, lastService, latestInspection);
  const components = getComponentHealth(latestInspection);
  const nextService = getNextService(vehicle, lastService);
  const recommendations = getRecommendations({ vehicle, components, inspections, nextService, health });


  await HealthScore.findOneAndUpdate(
  { vehicleId: vehicle._id, date: new Date().toISOString().slice(0, 10) },
  { score: health.score, status: health.status },
  { upsert: true }
);

  res.json({ vehicle, health, components, nextService, recommendations });
};