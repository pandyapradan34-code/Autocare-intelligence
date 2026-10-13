import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { getInspections, addInspection } from "../controllers/inspectionController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getInspections);
router.post("/", adminOnly, addInspection);

export default router;