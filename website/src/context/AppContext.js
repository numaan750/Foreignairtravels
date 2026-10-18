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

const API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");
const TOKEN_KEY = "userToken";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const tokenRef = useRef(null);
  const didInit = useRef(false); // dev mode mein double call rokne ke liye

  // ---------- Session helpers ----------
  const clearSession = useCallback(() => {
    tokenRef.current = null;
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
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

        // Token expire/invalid ho to session khatam
        if (res.status === 401 && tokenRef.current) clearSession();

        return { ok: res.ok && data.success !== false, status: res.status, data };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          data: { message: "Server se connect nahi ho pa raha. Thori der baad try karein." },
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
      const { ok, data } = await request("/api/user/me");

      if (ok) setUser(data.user);
      else clearSession();

      setAuthLoading(false);
    };

    verify();
  }, [request, clearSession]);

  // =====================================================
  // API SECTIONS (har nayi API yahan add hogi)
  // =====================================================

  // ---------- AUTH ----------
  const register = useCallback(
    async (details) => {
      const { ok, data } = await request("/api/user/register", {
        method: "POST",
        body: details,
      });
      return { ok, message: data.message };
    },
    [request]
  );

  const login = useCallback(
    async (email, password) => {
      const { ok, data } = await request("/api/user/login", {
        method: "POST",
        body: { email, password },
      });

      if (ok) {
        tokenRef.current = data.token;
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return { ok: true };
      }

      // code === "EMAIL_NOT_VERIFIED" ho to UI "dobara email bhejo" dikha sakti hai
      return { ok: false, message: data.message || "Login fail ho gaya", code: data.code };
    },
    [request]
  );

  const verifyEmail = useCallback(
    async (token) => {
      const { ok, data } = await request("/api/user/verify-email", {
        method: "POST",
        body: { token },
      });
      return { ok, message: data.message };
    },
    [request]
  );

  const sendApprovalNotification = useCallback(
    async (token) => {
      const { ok, data } = await request("/api/user/approval-notification", {
        method: "POST",
        body: { token },
      });
      return { ok, message: data.message };
    },
    [request]
  );

  const resendVerification = useCallback(
    async (email) => {
      const { ok, data } = await request("/api/user/resend-verification", {
        method: "POST",
        body: { email },
      });
      return { ok, message: data.message, code: data.code };
    },
    [request]
  );

  const getMe = useCallback(async () => {
    const { ok, data } = await request("/api/user/me");
    if (ok) setUser(data.user);
    return { ok, user: data.user, message: data.message };
  }, [request]);

  const updateMe = useCallback(
    async (updates) => {
      const { ok, data } = await request("/api/user/me", {
        method: "PUT",
        body: updates,
      });
      if (ok) setUser(data.user);
      return { ok, user: data.user, message: data.message };
    },
    [request]
  );

  const deleteMe = useCallback(
    async (password) => {
      const { ok, data } = await request("/api/user/me", {
        method: "DELETE",
        body: { password },
      });
      if (ok) clearSession();
      return { ok, message: data.message };
    },
    [request, clearSession]
  );

  const logout = useCallback(() => clearSession(), [clearSession]);

  // ---------- PACKAGES (public, token nahi chahiye) ----------
  const getPackages = useCallback(() => request("/api/packages"), [request]);

  // ---------- SERVICES (public, token nahi chahiye) ----------
  const getServices = useCallback(() => request("/api/services"), [request]);

  // ---------- AIRLINES (public, token nahi chahiye) ----------
  const getAirlines = useCallback(() => request("/api/airlines"), [request]);

  // ---------- COUNTRIES (public, token nahi chahiye) ----------
  const getCountries = useCallback(() => request("/api/countries"), [request]);
  
  // ---------- BANK ACCOUNTS (logged-in user, token request() khud bhejta hai) ----------
  const getBankAccounts = useCallback(() => request("/api/bank-accounts"), [request]);

  // ---------- Aage ki APIs yahan add hongi (bookings, profile wagera) ----------

  const value = useMemo(
    () => ({
      user,
      authLoading,
      register,
      login,
      verifyEmail,
      sendApprovalNotification,
      resendVerification,
      getMe,
      updateMe,
      deleteMe,
      logout,
      getPackages,
      getServices,
      getAirlines,
      getCountries,
      getBankAccounts,
    }),
    [user, authLoading, register, login, verifyEmail, sendApprovalNotification, resendVerification, getMe, updateMe, deleteMe, logout, getPackages, getServices, getAirlines, getCountries, getBankAccounts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp ko AppProvider ke andar use karo");
  return context;
}