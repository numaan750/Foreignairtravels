"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TOKEN_KEY = "adminToken";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const tokenRef = useRef(null);
  const didInit = useRef(false); // dev mode mein double call rokne ke liye

  // ---------- Session helpers ----------
  const clearSession = useCallback(() => {
    tokenRef.current = null;
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  // ---------- Core request (sirf is file ke andar use hoga) ----------
  const request = useCallback(
    async (path, { method = "GET", body } = {}) => {
      try {
        const res = await fetch(`${API_URL}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(tokenRef.current
              ? { Authorization: `Bearer ${tokenRef.current}` }
              : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json().catch(() => ({}));

        // Token expire/invalid ho to session khatam (redirect layout khud karega)
        if (res.status === 401 && tokenRef.current) clearSession();

        return { ok: res.ok && data.success !== false, status: res.status, data };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          data: { message: "Server se connect nahi ho pa raha. Backend chal raha hai?" },
        };
      }
    },
    [clearSession]
  );

  // ---------- Page load par token verify (sirf ek baar) ----------
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const verify = async () => {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (!saved) {
        setAuthLoading(false);
        return;
      }

      tokenRef.current = saved;
      const { ok, data } = await request("/api/admin/profile");

      if (ok) setAdmin(data.admin);
      else clearSession();

      setAuthLoading(false);
    };

    verify();
  }, [request, clearSession]);

  // =====================================================
  // API SECTIONS (har nayi API yahan add hogi)
  // =====================================================

  // ---------- AUTH ----------
  const login = useCallback(
    async (email, password) => {
      const { ok, data } = await request("/api/admin/login", {
        method: "POST",
        body: { email, password },
      });

      if (ok) {
        tokenRef.current = data.token;
        localStorage.setItem(TOKEN_KEY, data.token);
        setAdmin(data.admin);
        return { ok: true };
      }
      return { ok: false, message: data.message || "Login fail ho gaya" };
    },
    [request]
  );

  const logout = useCallback(() => clearSession(), [clearSession]);

  // ---------- TRIPS (example, abhi comment hai) ----------
  // const getTrips = useCallback(() => request("/trips"), [request]);
  // const createTrip = useCallback((body) => request("/trips", { method: "POST", body }), [request]);
  // const updateTrip = useCallback((id, body) => request(`/trips/${id}`, { method: "PUT", body }), [request]);
  // const deleteTrip = useCallback((id) => request(`/trips/${id}`, { method: "DELETE" }), [request]);

  const value = useMemo(
    () => ({
      admin,
      authLoading,
      login,
      logout,
      // getTrips, createTrip, updateTrip, deleteTrip,  (add karte jao)
    }),
    [admin, authLoading, login, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp ko AppProvider ke andar use karo");
  return context;
}