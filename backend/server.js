import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { connectDB } from "./config/db.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("AutoCare API running"));

// Protect all /api routes with requireAuth()
app.use("/api", requireAuth());

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", dashboardRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});