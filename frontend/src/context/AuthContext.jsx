import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const AuthContext = createContext(null);
const STORAGE_KEY = 'autocare_demo_session';
const demoUsers = {
  admin: { id: 'admin-001', role: 'admin', name: 'Pradan Pandya', email: 'admin@demo.com', phone: '+91 91234 56789', avatarInitials: 'PP' },
  customer: { id: 'cust-001', role: 'customer', name: 'Rohan Mehta', email: 'customer@demo.com', phone: '+91 98765 43210', avatarInitials: 'RM', vehicleId: 1 },
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('demo-session');
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    try { const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); if (saved?.user) { setUser(saved.user); setToken('demo-session'); } }
    catch {} finally { setInitializing(false); }
  }, []);
  const login = useCallback(async (credentials) => {
    if (credentials.role === 'admin') {
      if (credentials.email?.toLowerCase() !== 'admin@demo.com' || credentials.password !== 'admin123') return { success: false, message: 'Invalid demo admin credentials.' };
      const next = { ...demoUsers.admin };
      setUser(next); setToken('demo-session'); sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next }));
      return { success: true, user: next };
    }
    const plate = String(credentials.registrationNumber || '').replace(/\s/g, '').toUpperCase();
    const phone = String(credentials.phone || '').replace(/\D/g, '');
    if (!['MH12AB4521', 'MH12AB4521'].includes(plate) || !phone.endsWith('9876543210')) return { success: false, message: 'Demo customer: use plate MH12 AB 4521 and mobile 98765 43210.' };
    const next = { ...demoUsers.customer };
    setUser(next); setToken('demo-session'); sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next }));
    return { success: true, user: next };
  }, []);
  const logout = useCallback(() => { setUser(null); setToken(''); sessionStorage.removeItem(STORAGE_KEY); }, []);
  const updateUser = useCallback((updated) => setUser(u => { const next = { ...u, ...updated }; sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next })); return next; }), []);
  return <AuthContext.Provider value={{ user, token, login, logout, updateUser, initializing }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
