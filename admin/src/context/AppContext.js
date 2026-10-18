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

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
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
        const isForm = body instanceof FormData;

        const res = await fetch(`${API_URL}${path}`, {
          method,
          headers: {
            ...(isForm ? {} : { "Content-Type": "application/json" }),
            ...(tokenRef.current
              ? { Authorization: `Bearer ${tokenRef.current}` }
              : {}),
          },
          body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
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


    // ---------- PACKAGES ----------
  const getPackages = useCallback(() => request("/api/packages?all=true"), [request]);
  const createPackage = useCallback((body) => request("/api/packages", { method: "POST", body }), [request]);
  const updatePackage = useCallback((id, body) => request(`/api/packages/${id}`, { method: "PUT", body }), [request]);
  const deletePackage = useCallback((id) => request(`/api/packages/${id}`, { method: "DELETE" }), [request]);


    // ---------- SERVICES ----------
  const getServices = useCallback(() => request("/api/services"), [request]);
  const createService = useCallback((body) => request("/api/services", { method: "POST", body }), [request]);
  const updateService = useCallback((id, body) => request(`/api/services/${id}`, { method: "PUT", body }), [request]);
  const deleteService = useCallback((id) => request(`/api/services/${id}`, { method: "DELETE" }), [request]);
  
  // ---------- UPLOAD ----------
  const uploadImage = useCallback(
    (file) => {
      const formData = new FormData();
      formData.append("image", file);
      return request("/api/upload", { method: "POST", body: formData });
    },
    [request]
  );

  const value = useMemo(
    () => ({
      admin,
      authLoading,
      login,
            logout,
      getPackages,
      createPackage,
      updatePackage,
      deletePackage,
      uploadImage,
      getServices,
      createService,
      updateService,
      deleteService,
    }),
    [admin, authLoading, login, logout, getPackages, createPackage, updatePackage, deletePackage, uploadImage, getServices, createService, updateService, deleteService,]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp ko AppProvider ke andar use karo");
  return context;
}