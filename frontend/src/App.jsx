import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import AuthLayout from "./layouts/AuthLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import CustomerDashboard from "./pages/customer/Dashboard";
import MyCar from "./pages/customer/MyCar";
import VehicleHealth from "./pages/customer/VehicleHealth";
import ComponentHealth from "./pages/customer/ComponentHealth";
import ServiceHistory from "./pages/customer/ServiceHistory";
import NextService from "./pages/customer/NextService";
import LifeExpectancy from "./pages/customer/LifeExpectancy";
import Recommendations from "./pages/customer/Recommendations";
import MaintenanceCost from "./pages/customer/MaintenanceCost";
import CustomerProfile from "./pages/customer/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import Vehicles from "./pages/admin/Vehicles";
import ServiceRecords from "./pages/admin/ServiceRecords";
import AddService from "./pages/admin/AddService";
import HealthOverview from "./pages/admin/HealthOverview";
import MaintenanceAnalysis from "./pages/admin/MaintenanceAnalysis";
import Reports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Customer routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="car" element={<MyCar />} />
          <Route path="health" element={<VehicleHealth />} />
          <Route path="component-health" element={<ComponentHealth />} />
          <Route path="service-history" element={<ServiceHistory />} />
          <Route path="next-service" element={<NextService />} />
          <Route path="life-expectancy" element={<LifeExpectancy />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="maintenance" element={<MaintenanceCost />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="services" element={<ServiceRecords />} />
          <Route path="services/add" element={<AddService />} />
          <Route path="health" element={<HealthOverview />} />
          <Route path="maintenance" element={<MaintenanceAnalysis />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
