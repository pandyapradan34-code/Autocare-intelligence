import mongoose from "mongoose";

const healthScoreSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    clerkUserId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" or "YYYY"
    score: Number,
    status: String,
  },
  { timestamps: true }
);

healthScoreSchema.index({ vehicleId: 1, date: 1 }, { unique: true });

export default mongoose.model("HealthScore", healthScoreSchema);