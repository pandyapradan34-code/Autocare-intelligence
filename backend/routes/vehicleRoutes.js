import express from "express";

import { protect } from "../middleware/auth.js";
import { loadVehicle } from "../middleware/vehicleAccess.js";

import {
  getMe,
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import { getInsights } from "../controllers/insightsController.js";
import { getAnalytics } from "../controllers/analyticsController.js";

import serviceRoutes from "./serviceRoutes.js";
import inspectionRoutes from "./inspectionRoutes.js";

const router = express.Router();

router.use(protect); // neeche sab routes protected

router.get("/me", getMe);

router.route("/").get(getVehicles).post(addVehicle);

// Analytics
router.get("/:vehicleId/analytics", loadVehicle, getAnalytics);

// Insights
router.get("/:vehicleId/insights", loadVehicle, getInsights);

// Nested routes
router.use("/:vehicleId/services", loadVehicle, serviceRoutes);

router.use("/:vehicleId/inspections", loadVehicle, inspectionRoutes);

// Vehicle by ID
router.route("/:id").get(getVehicleById).put(updateVehicle).delete(deleteVehicle);

export default router;