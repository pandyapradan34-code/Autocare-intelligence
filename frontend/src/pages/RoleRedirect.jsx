import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function RoleRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Signing you in...</p>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  const role = user?.publicMetadata?.role;

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
}