import Vehicle from "../models/Vehicle.js";

// GET /api/me
export const getMe = (req, res) => res.json(req.user);

// POST /api/vehicles
export const addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, brand, model, year, currentMileage, fuelType, accidentHistory } = req.body;
    if (!vehicleNumber || !brand || !model || !year || currentMileage == null)
      return res.status(400).json({ message: "Required fields missing" });

    const vehicle = await Vehicle.create({
      ownerId: req.user._id,
      vehicleNumber, brand, model, year, currentMileage, fuelType, accidentHistory,
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/vehicles  (customer: apni, admin: sabki)
export const getVehicles = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { ownerId: req.user._id };
  const vehicles = await Vehicle.find(filter).populate("ownerId", "name email").sort("-createdAt");
  res.json(vehicles);
};

// GET /api/vehicles/:id
export const getVehicleById = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("ownerId", "name email");
  if (!vehicle) return res.status(404).json({ message: "Not found" });

  const isOwner = vehicle.ownerId._id.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  res.json(vehicle);
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: "Not found" });

  const isOwner = vehicle.ownerId.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  Object.assign(vehicle, req.body, { ownerId: vehicle.ownerId }); // owner change nahi hoga
  await vehicle.save();
  res.json(vehicle);
};