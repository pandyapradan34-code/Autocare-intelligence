import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getStats,
  getCustomers,
  getAdminVehicles,
  getAdminServiceRecords,
  getRecentServices,
  getCriticalAlerts,
  addAdminService,
  getAdminProfile,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin only middleware guard
router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/customers", getCustomers);
router.get("/vehicles", getAdminVehicles);
router.get("/service-records", getAdminServiceRecords);
router.get("/recent-services", getRecentServices);
router.get("/critical-alerts", getCriticalAlerts);
router.post("/services", addAdminService);
router.get("/profile", getAdminProfile);

export default router;