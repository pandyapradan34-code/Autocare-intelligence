import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getOverallHealth,
  getComponentsHealth,
  getHealthTrend,
  getRecommendations,
  getMaintenanceSummary,
  getServices,
  createService,
  getNextService,
  getLifeExpectancy,
  getProfile,
  updateProfile,
} from "../controllers/dashboardController.js";

const router = express.Router();
router.use(protect);

// Customer endpoints (all support optional ?vehicleId=):
router.get("/health", getOverallHealth);
router.get("/health/components", getComponentsHealth);
router.get("/health/trend", getHealthTrend);
router.get("/services", getServices);
router.post("/services", createService);
router.get("/services/next", getNextService);
router.get("/life-expectancy", getLifeExpectancy);
router.get("/recommendations", getRecommendations);
router.get("/maintenance", getMaintenanceSummary);
router.route("/profile").get(getProfile).put(updateProfile);

export default router;
