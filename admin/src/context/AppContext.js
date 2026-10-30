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
          data: { message: "Unable to connect to the server. Please try again shortly." },
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
      return { ok: false, message: data.message || "Login failed." };
    },
    [request]
  );

  const logout = useCallback(() => clearSession(), [clearSession]);

  // ---------- CUSTOMERS ----------
  const getCustomers = useCallback(() => request("/api/admin/customers"), [request]);
  const approveCustomer = useCallback(
    (id, file) => {
      const formData = new FormData();
      if (file) formData.append("image", file);
      return request(`/api/admin/customers/${id}/approve`, { method: "POST", body: formData });
    },
    [request]
  );
  const updateCustomerProfileImage = useCallback(
    (id, file) => {
      const formData = new FormData();
      formData.append("image", file);
      return request(`/api/admin/customers/${id}/profile-image`, { method: "POST", body: formData });
    },
    [request]
  );
  const unverifyCustomer = useCallback(
    (id) => request(`/api/admin/customers/${id}/unverify`, { method: "PATCH" }),
    [request]
  );
  const deleteCustomer = useCallback(
    (id) => request(`/api/admin/customers/${id}`, { method: "DELETE" }),
    [request]
  );
  const getInquiries = useCallback(() => request("/api/admin/inquiries"), [request]);
  const updateInquiryStatus = useCallback(
    (id, status) => request(`/api/admin/inquiries/${id}/status`, { method: "PATCH", body: { status } }),
    [request]
  );

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
  // ---------- AIRLINES ----------
  const getAirlines = useCallback(() => request("/api/airlines"), [request]);
  const createAirline = useCallback((body) => request("/api/airlines", { method: "POST", body }), [request]);
  const updateAirline = useCallback((id, body) => request(`/api/airlines/${id}`, { method: "PUT", body }), [request]);
  const deleteAirline = useCallback((id) => request(`/api/airlines/${id}`, { method: "DELETE" }), [request]);
  // ---------- COUNTRIES ----------
  const getCountries = useCallback(() => request("/api/countries"), [request]);
  const createCountry = useCallback((body) => request("/api/countries", { method: "POST", body }), [request]);
  const updateCountry = useCallback((id, body) => request(`/api/countries/${id}`, { method: "PUT", body }), [request]);
  const deleteCountry = useCallback((id) => request(`/api/countries/${id}`, { method: "DELETE" }), [request]);
  // ---------- BANK ACCOUNTS ----------
  const getBankAccounts = useCallback(() => request("/api/bank-accounts/admin"), [request]);
  const createBankAccount = useCallback((body) => request("/api/bank-accounts", { method: "POST", body }), [request]);
  const updateBankAccount = useCallback((id, body) => request(`/api/bank-accounts/${id}`, { method: "PUT", body }), [request]);
  const deleteBankAccount = useCallback((id) => request(`/api/bank-accounts/${id}`, { method: "DELETE" }), [request]);
  // ---------- ANNOUNCEMENTS ----------
  const getAnnouncements = useCallback(() => request("/api/announcements/admin"), [request]);
  const createAnnouncement = useCallback((body) => request("/api/announcements", { method: "POST", body }), [request]);
  const updateAnnouncement = useCallback((id, body) => request(`/api/announcements/${id}`, { method: "PUT", body }), [request]);
  const deleteAnnouncement = useCallback((id) => request(`/api/announcements/${id}`, { method: "DELETE" }), [request]);

    // ---------- POPUP IMAGES ----------
  const getPopupImages = useCallback(() => request("/api/popup-images"), [request]);
  const createPopupImage = useCallback((body) => request("/api/popup-images", { method: "POST", body }), [request]);
  const deletePopupImage = useCallback((id) => request(`/api/popup-images/${id}`, { method: "DELETE" }), [request]);
    // ---------- GROUP TICKET CATEGORIES ----------
  const getGroupTicketCategories = useCallback(() => request("/api/group-ticket-categories?all=true"), [request]);
  const createGroupTicketCategory = useCallback((body) => request("/api/group-ticket-categories", { method: "POST", body }), [request]);
  const updateGroupTicketCategory = useCallback((id, body) => request(`/api/group-ticket-categories/${id}`, { method: "PUT", body }), [request]);
  const deleteGroupTicketCategory = useCallback((id) => request(`/api/group-ticket-categories/${id}`, { method: "DELETE" }), [request]);
  // ---------- GROUP TICKETS ----------
  const getGroupTickets = useCallback((category) => request(`/api/group-tickets?all=true${category ? `&category=${category}` : ""}`), [request]);
  const createGroupTicket = useCallback((body) => request("/api/group-tickets", { method: "POST", body }), [request]);
  const updateGroupTicket = useCallback((id, body) => request(`/api/group-tickets/${id}`, { method: "PUT", body }), [request]);
  const deleteGroupTicket = useCallback((id) => request(`/api/group-tickets/${id}`, { method: "DELETE" }), [request]);

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
      getCustomers,
      approveCustomer,
      updateCustomerProfileImage,
      unverifyCustomer,
      deleteCustomer,
      getInquiries,
      updateInquiryStatus,
      getPackages,
      createPackage,
      updatePackage,
      deletePackage,
      getGroupTicketCategories,
      createGroupTicketCategory,
      updateGroupTicketCategory,
      deleteGroupTicketCategory,
      getGroupTickets,
      createGroupTicket,
      updateGroupTicket,
      deleteGroupTicket,
      uploadImage,
      getServices,
      createService,
      updateService,
      deleteService,
      getCountries,
      createCountry,
      updateCountry,
      deleteCountry,
      getBankAccounts,
      createBankAccount,
      updateBankAccount,
      deleteBankAccount,
      getAnnouncements,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
       getPopupImages,
      createPopupImage,
      deletePopupImage,
      getAirlines, createAirline, updateAirline, deleteAirline,
    }),
    [admin, authLoading, login, logout, getCustomers, approveCustomer, updateCustomerProfileImage, unverifyCustomer, deleteCustomer, getInquiries, updateInquiryStatus, getPackages, createPackage, updatePackage, deletePackage, getGroupTicketCategories, createGroupTicketCategory, updateGroupTicketCategory, deleteGroupTicketCategory, getGroupTickets, createGroupTicket, updateGroupTicket, deleteGroupTicket, uploadImage, getServices, createService, updateService, deleteService, getAirlines, createAirline, updateAirline, deleteAirline, getCountries, createCountry, updateCountry, deleteCountry, getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount,
      getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,getPopupImages, createPopupImage, deletePopupImage,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider.");
  return context;
}