import Vehicle from "../models/Vehicle.js";

export const loadVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const isOwner = vehicle.ownerId.equals(req.user._id);
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    req.vehicle = vehicle;
    next();
  } catch {
    res.status(400).json({ message: "Invalid vehicle id" });
  }
};