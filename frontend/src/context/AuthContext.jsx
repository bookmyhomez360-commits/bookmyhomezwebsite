import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiMe, apiLogin, apiRegister, apiLogout } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = user
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If returning from Google OAuth callback, skip /me — AuthCallback handles it
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const u = await apiLogin({ email, password });
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const u = await apiRegister({ name, email, password });
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, refresh: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
