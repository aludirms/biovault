import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/apiClient";

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  {
    id: "usr-001",
    name: "Dr. Mira Sharma",
    email: "admin@biovault.org",
    role: "admin",
    roleLabel: "Biobank Administrator",
    department: "Genomics & Bio-Repository Directorate",
    avatar: "MS",
    badgeColor: "emerald",
  },
  {
    id: "usr-002",
    name: "Marcus Vance",
    email: "tech@biovault.org",
    role: "technician",
    roleLabel: "Senior Lab Technician",
    department: "Sample Processing & Storage Core",
    avatar: "MV",
    badgeColor: "cyan",
  },
  {
    id: "usr-003",
    name: "Dr. Elena Rostova",
    email: "researcher@biovault.org",
    role: "researcher",
    roleLabel: "Principal Investigator",
    department: "Oncology Precision Therapeutics",
    avatar: "ER",
    badgeColor: "purple",
  },
  {
    id: "usr-004",
    name: "Julian Hayes",
    email: "auditor@biovault.org",
    role: "auditor",
    roleLabel: "Quality Assurance Auditor",
    department: "Regulatory Compliance & Audit",
    avatar: "JH",
    badgeColor: "amber",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Start logged out by default so the login screen is the first screen seen
    const saved = sessionStorage.getItem("biovault_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem("biovault_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("biovault_user", JSON.stringify(user));
      localStorage.setItem("biovault_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("biovault_user");
      sessionStorage.removeItem("biovault_token");
      localStorage.removeItem("biovault_user");
      localStorage.removeItem("biovault_token");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        sessionStorage.setItem("biovault_token", res.token);
        localStorage.setItem("biovault_token", res.token);
        return { success: true };
      }
    } catch (err) {
      // Fallback for demo credentials if server returns error
      const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (match) {
        setUser(match);
        setToken("demo-token");
        sessionStorage.setItem("biovault_token", "demo-token");
        localStorage.setItem("biovault_token", "demo-token");
        return { success: true };
      }
      return { success: false, message: err.message || "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        sessionStorage.setItem("biovault_token", res.token);
        localStorage.setItem("biovault_token", res.token);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = (account) => {
    setUser(account);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("biovault_token");
    sessionStorage.removeItem("biovault_user");
    localStorage.removeItem("biovault_token");
    localStorage.removeItem("biovault_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        switchAccount,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
