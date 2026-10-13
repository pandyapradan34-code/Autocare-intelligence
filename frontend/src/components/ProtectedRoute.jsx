import { Navigate, Outlet } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

/**
 * ProtectedRoute — requires the user to be signed in via Clerk.
 * Shows a spinner while Clerk is loading.
 * Redirects unauthenticated users to /login.
 */
const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useClerkAuth();

  // Wait until Clerk has finished loading
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;