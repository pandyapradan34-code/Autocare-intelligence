import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { findUserByCredentials } from "../data/authData";

// Dummy, frontend-only authentication context.
// Phase 2 will replace this with real session/token-based auth against a backend.

const AuthContext = createContext(null);

const STORAGE_KEY = "vhis_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setInitializing(false);
  }, []);

  const login = useCallback(({ email, password, role }) => {
    const found = findUserByCredentials(email, password, role);
    if (!found) {
      return { success: false, message: "Invalid email, password, or role." };
    }
    setUser(found);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
    return { success: true, user: found };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
