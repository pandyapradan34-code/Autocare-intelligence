import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    currentMileage: { type: Number, required: true, min: 0 },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"], default: "Petrol" },
    accidentHistory: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);