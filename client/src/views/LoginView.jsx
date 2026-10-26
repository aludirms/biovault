import React, { useState } from "react";
import {
  Dna,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  User,
  FlaskConical,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../context/AuthContext";

export const LoginView = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [activePortal, setActivePortal] = useState("admin"); // 'admin' or 'user'
  const [email, setEmail] = useState("admin@biovault.org");
  const [password, setPassword] = useState("biovault123");
  const [error, setError] = useState("");

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError("");
    if (portal === "admin") {
      setEmail("admin@biovault.org");
      setPassword("biovault123");
    } else {
      setEmail("researcher@biovault.org");
      setPassword("biovault123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(result.message || "Invalid institutional credentials.");
    }
  };

  const handleQuickDemoLogin = async (acc) => {
    setEmail(acc.email);
    setPassword("biovault123");
    setActivePortal(acc.role === "admin" ? "admin" : "user");
    setError("");
    const result = await login(acc.email, "biovault123");
    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: `radial-gradient(circle at 50% 20%, rgba(0, 153, 200, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.06) 0%, transparent 50%), #f0f4f8`,
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: "500px",
          maxWidth: "100%",
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1), 0 0 30px rgba(0, 153, 200, 0.08)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0099c8 0%, #2563eb 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(0, 153, 200, 0.35)",
              marginBottom: "12px",
            }}
          >
            <Dna size={30} color="#ffffff" strokeWidth={2.5} />
          </div>

          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #0f172a 40%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            BIOVAULT
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Institutional Biological Repository & Specimen Management
          </p>
        </div>

        {/* Role Portal Toggle (Admin vs User) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            background: "rgba(0, 0, 0, 0.05)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => handlePortalSwitch("admin")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activePortal === "admin" ? "#ffffff" : "transparent",
              color: activePortal === "admin" ? "#0369a1" : "var(--text-secondary)",
              fontWeight: activePortal === "admin" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: activePortal === "admin" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("user")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activePortal === "user" ? "#ffffff" : "transparent",
              color: activePortal === "user" ? "#059669" : "var(--text-secondary)",
              fontWeight: activePortal === "user" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: activePortal === "user" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            <FlaskConical size={16} />
            <span>User / Staff Login</span>
          </button>
        </div>

        {/* Clearance Level Info Pill */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: activePortal === "admin" ? "rgba(0, 153, 200, 0.08)" : "rgba(5, 150, 105, 0.08)",
            border: activePortal === "admin" ? "1px solid rgba(0, 153, 200, 0.2)" : "1px solid rgba(5, 150, 105, 0.2)",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className={`status-dot ${activePortal === "admin" ? "status-dot-emerald" : "status-dot-emerald"}`}
            />
            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {activePortal === "admin" ? "Administrator Access" : "Standard Researcher / Staff Access"}
            </span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            {activePortal === "admin" ? "Level 4 (Full Governance)" : "Level 2 (Specimens & Requests)"}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#e11d48",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Institutional Email / Biobank ID
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="email"
                required
                className="glass-input"
                style={{ paddingLeft: "36px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@biovault.org"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Access Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="password"
                required
                className="glass-input"
                style={{ paddingLeft: "36px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "11px", fontSize: "0.92rem", marginTop: "6px" }}
            disabled={loading}
          >
            {loading ? "Authenticating Clearance..." : `Authenticate as ${activePortal === "admin" ? "Administrator" : "User"}`}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Fast Role Select (All 4 Clinical Roles) */}
        <div style={{ marginTop: "22px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Sparkles size={13} color="var(--cryo-cyan)" />
            <span>Fast Role-Based Demo Selection:</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isAdmin = acc.role === "admin";
              return (
                <button
                  key={acc.id}
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="glass-card"
                  style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  title={`Login as ${acc.roleLabel}`}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isAdmin ? "linear-gradient(135deg, #0099c8, #2563eb)" : "linear-gradient(135deg, #059669, #10b981)",
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {acc.avatar}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: "0.62rem", color: isAdmin ? "#0369a1" : "var(--text-secondary)", fontWeight: 600, textTransform: "capitalize" }}>
                      {acc.roleLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
