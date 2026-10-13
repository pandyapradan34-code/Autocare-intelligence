import Inspection from "../models/Inspection.js";

// GET /api/vehicles/:vehicleId/inspections
export const getInspections = async (req, res) => {
  const list = await Inspection.find({ vehicleId: req.vehicle._id }).sort("-inspectionDate");
  res.json(list);
};

// POST /api/vehicles/:vehicleId/inspections  (admin)
export const addInspection = async (req, res) => {
  try {
    const { engine, brakes, battery, tyres, suspension, transmission, cooling, inspectionDate } = req.body;
    const inspection = await Inspection.create({
      vehicleId: req.vehicle._id,
      engine, brakes, battery, tyres, suspension, transmission, cooling,
      inspectionDate: inspectionDate || Date.now(),
    });
    res.status(201).json(inspection);
  } catch (err) {
    res.status(400).json({ message: err.message }); // 0-100 se bahar ya missing field
  }
};