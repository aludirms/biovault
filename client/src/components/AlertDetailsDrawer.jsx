import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Server,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  ThermometerSnowflake,
  Layers,
  Wrench,
  Dna,
} from "lucide-react";
import { api } from "../api/apiClient";

export const AlertDetailsDrawer = ({ alert, onClose, onAlertUpdated, onInspectSample }) => {
  const [resolving, setResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!alert) return null;

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/alerts/${alert.alertId}/acknowledge`);
      if (res.success) {
        if (onAlertUpdated) onAlertUpdated(res.alert);
      }
    } catch (err) {
      alert("Error acknowledging alert: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/alerts/${alert.alertId}/resolve`, { resolutionNotes });
      if (res.success) {
        setResolving(false);
        if (onAlertUpdated) onAlertUpdated(res.alert);
      }
    } catch (err) {
      alert("Error resolving alert: " + err.message);
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
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.8)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(244, 63, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f43f5e",
                border: "1px solid rgba(244, 63, 94, 0.3)",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.3px" }}>
                {alert.alertId}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {alert.type} • {new Date(alert.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px", flex: 1, overflowY: "auto" }}>
          {/* Title & Severity */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                Severity: {alert.severity}
              </span>
              <span className={`badge ${alert.status === "Resolved" ? "badge-low" : "badge-purple"}`}>
                Status: {alert.status}
              </span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
              {alert.title}
            </h2>
          </div>

          {/* Description & Impact Analysis */}
          <div
            className="glass-card"
            style={{
              padding: "16px",
              marginBottom: "20px",
              background: "rgba(244, 63, 94, 0.08)",
              border: "1px solid rgba(244, 63, 94, 0.25)",
            }}
          >
            <div
              style={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              Telemetry Anomaly & Root Cause
            </div>
            <div style={{ fontSize: "0.85rem", color: "#fecdd3", lineHeight: "1.5" }}>
              {alert.description}
            </div>
          </div>

          {/* Storage Unit & Location */}
          {alert.freezerId && (
            <div className="glass-card" style={{ padding: "14px 16px", marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Server size={14} color="#00f2fe" />
                Affected Storage Unit
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0099c8" }}>
                {alert.freezerName || alert.freezerId}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                Unit ID: {alert.freezerId}
              </div>
            </div>
          )}

          {/* Affected Sample Card if tied to sample */}
          {alert.sampleId && (
            <div className="glass-card" style={{ padding: "14px 16px", marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Dna size={14} color="#10b981" />
                  Primary Affected Specimen
                </div>
                {onInspectSample && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: "0.68rem" }}
                    onClick={() => onInspectSample(alert.sampleId)}
                  >
                    Open Specimen Record
                  </button>
                )}
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {alert.sampleId}
              </div>
            </div>
          )}

          {/* Recommended Action Checklist */}
          <div
            className="glass-card"
            style={{ padding: "16px", marginBottom: "20px", background: "rgba(255, 255, 255, 0.8)" }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#10b981",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Wrench size={14} />
              Recommended Biobank Protocol Action
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              {alert.actionRequired || "Inspect temperature logs, verify backup LN2 pressure, and alert lab supervisor."}
            </div>
          </div>

          {/* Resolution form if active */}
          {resolving && (
            <div
              className="glass-panel"
              style={{ padding: "16px", marginBottom: "16px", border: "1px solid var(--border-medium)" }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", color: "#10b981" }}>
                Document Corrective Action & Close Alert
              </div>
              <textarea
                className="glass-input"
                style={{ height: "70px", resize: "none", marginBottom: "10px" }}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail maintenance action taken (e.g., refilled LN2 tank, recalibrated temperature sensor)..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button className="btn btn-ghost" onClick={() => setResolving(false)}>
                  Cancel
                </button>
                <button className="btn btn-emerald" onClick={handleResolve} disabled={loading}>
                  {loading ? "Resolving..." : "Confirm Resolved"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {!resolving && alert.status !== "Resolved" && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {alert.status === "Active" && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem" }}
                onClick={handleAcknowledge}
                disabled={loading}
              >
                <ShieldCheck size={15} />
                <span>Acknowledge Alert</span>
              </button>
            )}

            <button
              className="btn btn-emerald"
              style={{ flex: 1, fontSize: "0.82rem" }}
              onClick={() => setResolving(true)}
            >
              <CheckCircle2 size={15} />
              <span>Mark Alert Resolved</span>
            </button>
          </div>
        )}

        {alert.status === "Resolved" && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
              color: "#34d399",
              fontSize: "0.84rem",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.08)",
            }}
          >
            ✓ Alert Resolved & Storage Status Normalized
          </div>
        )}
      </div>
    </div>
  );
};
