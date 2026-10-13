import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";

import Landing from "./pages/Landing";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import RoleRedirect from "./pages/RoleRedirect";

import AuthLayout from "./layouts/AuthLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyCar from "./pages/customer/MyCar";
import VehicleHealth from "./pages/customer/VehicleHealth";
import ComponentHealth from "./pages/customer/ComponentHealth";
import ServiceHistory from "./pages/customer/ServiceHistory";
import NextService from "./pages/customer/NextService";
import LifeExpectancy from "./pages/customer/LifeExpectancy";
import Recommendations from "./pages/customer/Recommendations";
import MaintenanceCost from "./pages/customer/MaintenanceCost";
import CustomerProfile from "./pages/customer/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Customers from "./pages/admin/Customers";
import Vehicles from "./pages/admin/Vehicles";
import ServiceRecords from "./pages/admin/ServiceRecords";
import AddService from "./pages/admin/AddService";
import HealthOverview from "./pages/admin/HealthOverview";
import MaintenanceAnalysis from "./pages/admin/MaintenanceAnalysis";
import Reports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";

function Private({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn signInFallbackRedirectUrl="/redirect" />
      </SignedOut>
    </>
  );
}

function AdminOnly({ children }) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Checking permissions...</p>
      </div>
    );
  }

  if (user?.publicMetadata?.role !== "admin") {
    return <Navigate to="/redirect" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />

        <Route element={<AuthLayout />}>
          <Route path="/login/*" element={<SignInPage />} />
          <Route path="/register/*" element={<SignUpPage />} />
        </Route>

        <Route path="/redirect" element={<RoleRedirect />} />

        {/* Customer pages */}
        <Route
          element={
            <Private>
              <CustomerLayout />
            </Private>
          }
        >
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/car" element={<MyCar />} />
          <Route path="/customer/health" element={<VehicleHealth />} />
          <Route path="/customer/component-health" element={<ComponentHealth />} />
          <Route path="/customer/service-history" element={<ServiceHistory />} />
          <Route path="/customer/next-service" element={<NextService />} />
          <Route path="/customer/life-expectancy" element={<LifeExpectancy />} />
          <Route path="/customer/recommendations" element={<Recommendations />} />
          <Route path="/customer/maintenance" element={<MaintenanceCost />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>

        {/* Admin pages */}
        <Route
          element={
            <Private>
              <AdminOnly>
                <AdminLayout />
              </AdminOnly>
            </Private>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/vehicles" element={<Vehicles />} />
          <Route path="/admin/services" element={<ServiceRecords />} />
          <Route path="/admin/services/add" element={<AddService />} />
          <Route path="/admin/health" element={<HealthOverview />} />
          <Route path="/admin/maintenance" element={<MaintenanceAnalysis />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
