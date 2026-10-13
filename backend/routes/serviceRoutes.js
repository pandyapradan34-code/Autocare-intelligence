import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { getServices, addService, deleteService } from "../controllers/serviceController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getServices);
router.post("/", adminOnly, addService);
router.delete("/:serviceId", adminOnly, deleteService);

export default router;