import { createContext, useContext, useEffect } from "react";
import {
  useUser,
  useAuth as useClerkAuth,
} from "@clerk/clerk-react";
import { setTokenGetter } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();

  useEffect(() => {
    if (getToken) {
      setTokenGetter(getToken);
    }
  }, [getToken]);

  const logout = async () => {
    await signOut();
  };

  const getAuthToken = async () => {
    return await getToken();
  };

  const role = user?.publicMetadata?.role || "customer";

  const value = {
    user,
    isLoaded,
    isAuthenticated: Boolean(isSignedIn),
    role,
    logout,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export default AuthContext;