import mongoose from "mongoose";

const score = { type: Number, min: 0, max: 100, required: true };

const inspectionSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    engine: score,
    brakes: score,
    battery: score,
    tyres: score,
    suspension: score,
    transmission: score,
    cooling: score,
    inspectionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Inspection", inspectionSchema);