import express from "express";
import { protect } from "../middleware/auth.js";
import { getMe, addVehicle, getVehicles, getVehicleById, updateVehicle } from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.route("/").get(protect, getVehicles).post(protect, addVehicle);
router.route("/:id").get(protect, getVehicleById).put(protect, updateVehicle);

export default router;