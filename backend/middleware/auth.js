import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { isConnected } from "../config/db.js";

// In-memory fallback users cache if MongoDB is offline
const memoryUsers = new Map();

export const protect = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing authentication token" });
    }

    req.clerkUserId = userId;

    let role = auth?.sessionClaims?.publicMetadata?.role || auth?.sessionClaims?.metadata?.role;
    let email = "";
    let name = "AutoCare User";

    try {
      const cu = await clerkClient.users.getUser(userId);
      if (cu) {
        if (!role && cu.publicMetadata?.role) {
          role = cu.publicMetadata.role;
        }
        email = cu.emailAddresses?.[0]?.emailAddress || "";
        name = `${cu.firstName || ""} ${cu.lastName || ""}`.trim() || email.split("@")[0] || "AutoCare User";
      }
    } catch (err) {
      // Clerk API fetch fallback
      console.warn("Clerk user details lookup warning:", err.message);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    if (!role && email && adminEmails.includes(email.toLowerCase())) {
      role = "admin";
    }
    if (!role) {
      role = "customer";
    }

    let user = null;

    if (isConnected()) {
      try {
        user = await User.findOne({ clerkUserId: userId });
        if (!user) {
          user = await User.create({
            clerkUserId: userId,
            name,
            email: email || `${userId}@autocare.local`,
            role,
          });
        } else if (role && user.role !== role) {
          user.role = role;
          await user.save();
        }
      } catch (dbErr) {
        console.warn("User DB sync warning:", dbErr.message);
      }
    }

    if (!user) {
      user = memoryUsers.get(userId) || {
        _id: userId,
        clerkUserId: userId,
        name,
        email: email || `${userId}@autocare.local`,
        role,
      };
      user.role = role;
      memoryUsers.set(userId, user);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Protect middleware error:", err);
    res.status(401).json({ message: "Authentication failed", error: err.message });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.clerkUserId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let role = req.user?.role || auth?.sessionClaims?.publicMetadata?.role || auth?.sessionClaims?.metadata?.role;

    if (role !== "admin") {
      try {
        const cu = await clerkClient.users.getUser(userId);
        role = cu?.publicMetadata?.role;
      } catch (e) {
        // ignore
      }
    }

    if (role !== "admin") {
      return res.status(403).json({ message: "Admin access required. Customer forbidden from admin routes." });
    }

    next();
  } catch (err) {
    res.status(403).json({ message: "Admin verification failed", error: err.message });
  }
};