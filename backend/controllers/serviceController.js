import ServiceRecord from "../models/ServiceRecord.js";

// GET /api/vehicles/:vehicleId/services
export const getServices = async (req, res) => {
  const services = await ServiceRecord.find({ vehicleId: req.vehicle._id }).sort("-serviceDate");
  res.json(services);
};

// POST /api/vehicles/:vehicleId/services  (admin)
export const addService = async (req, res) => {
  try {
    const { serviceDate, odometer, serviceType, parts, cost, remarks } = req.body;
    if (!serviceDate || odometer == null || !serviceType)
      return res.status(400).json({ message: "serviceDate, odometer, serviceType required" });

    const service = await ServiceRecord.create({
      vehicleId: req.vehicle._id,
      serviceDate, odometer, serviceType,
      parts: parts || [],
      cost: cost || 0,
      remarks,
    });

    // vehicle ka mileage update karo agar naya odometer zyada hai
    if (odometer > req.vehicle.currentMileage) {
      req.vehicle.currentMileage = odometer;
      await req.vehicle.save();
    }

    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/vehicles/:vehicleId/services/:serviceId  (admin)
export const deleteService = async (req, res) => {
  await ServiceRecord.deleteOne({ _id: req.params.serviceId, vehicleId: req.vehicle._id });
  res.json({ message: "Deleted" });
};