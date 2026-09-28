import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Server,
  ShieldAlert,
  Flame,
  ThermometerSnowflake,
  Layers,
  Clock,
  CheckCircle2,
  Filter,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "../api/apiClient";

export const AlertsView = ({ onInspectAlert, onInspectSample }) => {
  const [alerts, setAlerts] = useState([]);
  const [riskSamples, setRiskSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'storage', 'samples'
  const [statusFilter, setStatusFilter] = useState("Active");

  useEffect(() => {
    fetchAlertsData();
  }, [statusFilter]);

  const fetchAlertsData = async () => {
    setLoading(true);
    try {
      const [alertsRes, samplesRes] = await Promise.all([
        api.get(`/alerts?status=${statusFilter}`),
        api.get("/samples?riskLevel=High"),
      ]);

      if (alertsRes.success) {
        setAlerts(alertsRes.alerts || []);
      }
      if (samplesRes.success) {
        setRiskSamples(samplesRes.samples || []);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case "Critical":
        return "badge-critical";
      case "High":
        return "badge-high";
      case "Warning":
        return "badge-high";
      default:
        return "badge-low";
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              Storage Alerts & Quality Risk Center
            </h1>
            <span
              style={{
                background: "rgba(244, 63, 94, 0.15)",
                color: "#f87171",
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid rgba(244, 63, 94, 0.3)",
              }}
            >
              {alerts.length} Storage Incidents
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Monitor cryogenic temperature drift, storage capacity warnings, and flagged high-risk specimens.
          </p>
        </div>

        {/* Status Filter Toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`btn ${statusFilter === "Active" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={() => setStatusFilter("Active")}
          >
            <span>Active Alerts</span>
          </button>
          <button
            className={`btn ${statusFilter === "All" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={() => setStatusFilter("All")}
          >
            <span>All Historical Alerts</span>
          </button>
        </div>
      </div>

      {/* Two Column Alert Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "22px" }}>
        {/* Left Column: Storage Unit Alerts List */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Server size={18} color="#f43f5e" />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                Storage Hardware & Sensor Telemetry Alerts
              </h2>
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              {alerts.length} Incidents
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Loading telemetry alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#34d399", fontSize: "0.85rem" }}>
              ✓ All freezers and cryo tanks operating within normal parameters.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id || alert.alertId}
                  className="glass-card"
                  onClick={() => onInspectAlert(alert)}
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.75)",
                    borderLeft: `4px solid ${
                      alert.severity === "Critical"
                        ? "#f43f5e"
                        : alert.severity === "High"
                        ? "#f59e0b"
                        : "#3b82f6"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`badge ${getSeverityBadgeClass(alert.severity)}`} style={{ fontSize: "0.64rem" }}>
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {alert.title}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Unit: <strong style={{ color: "#0369a1" }}>{alert.freezerName || alert.freezerId}</strong> • Logged {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`badge ${alert.status === "Resolved" ? "badge-low" : "badge-purple"}`}
                      style={{ fontSize: "0.68rem" }}
                    >
                      {alert.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "10px", lineHeight: "1.4" }}>
                    {alert.description}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} />
                      Action: {alert.actionRequired || "Inspect sensor & log"}
                    </div>
                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>
                      <span>View & Triage</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: High Risk / Urgent Specimens Triage */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} color="#f59e0b" />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                Specimens Flagged for Risk & Urgency
              </h2>
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              {riskSamples.length} High Risk
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {riskSamples.map((sample) => (
              <div
                key={sample.id || sample.sampleId}
                className="glass-card"
                onClick={() => onInspectSample(sample.sampleId)}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {sample.sampleId}
                  </span>
                  <span className="badge badge-critical" style={{ fontSize: "0.62rem" }}>
                    {sample.riskLevel}
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#be123c", marginTop: "4px" }}>
                  {sample.attentionReason || "Approaching expiration or temperature excursion exposure."}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Location: {sample.storageLocation?.freezerId} / {sample.storageLocation?.rack} / {sample.storageLocation?.box} / {sample.storageLocation?.position}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
