import React, { useState } from "react";
import { Dna, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../context/AuthContext";

export const LoginView = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@biovault.org");
  const [password, setPassword] = useState("biovault123");
  const [error, setError] = useState("");

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
        background: `radial-gradient(circle at 50% 20%, rgba(0, 153, 200, 0.07) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.05) 0%, transparent 50%), #f0f4f8`,
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: "480px",
          maxWidth: "100%",
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1), 0 0 30px rgba(0, 153, 200, 0.08)",
          border: "1px solid var(--border-medium)",
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(0, 242, 254, 0.4)",
              marginBottom: "12px",
            }}
          >
            <Dna size={30} color="#040814" strokeWidth={2.5} />
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

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#f87171",
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
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
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
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
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
            {loading ? "Authenticating Credentials..." : "Authenticate & Access BioVault"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login Profiles */}
        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)" }}>
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
            <Sparkles size={13} color="#00f2fe" />
            <span>Fast Demo Access (Pre-configured Staff Accounts):</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {DEMO_ACCOUNTS.map((acc) => (
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
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: acc.role === "admin" ? "#10b981" : acc.role === "technician" ? "#00f2fe" : "#a855f7",
                    color: "#040814",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {acc.avatar}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                    {acc.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
