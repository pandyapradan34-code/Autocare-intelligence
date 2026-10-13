import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleRoute — requires the signed-in user to have one of the allowed roles.
 * Role is read from Clerk's publicMetadata via AuthContext (never localStorage).
 *
 * Usage in routes:
 *   <Route element={<RoleRoute allowedRoles={["customer"]} />}>
 *     <Route path="/dashboard" element={<CustomerDashboard />} />
 *   </Route>
 */
const RoleRoute = ({ allowedRoles }) => {
  const { user, isLoaded } = useAuth();

  // AuthContext derives isLoaded from Clerk's useUser — wait for it
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard instead of a blank page
    const home = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;