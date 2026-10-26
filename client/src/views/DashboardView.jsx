import React, { useState, useEffect } from "react";
import {
  Dna,
  Server,
  ClipboardList,
  AlertTriangle,
  Flame,
  ThermometerSnowflake,
  TrendingUp,
  Plus,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export const DashboardView = ({
  onOpenAddSample,
  onOpenNewRequest,
  onNavigate,
  onInspectSample,
  onInspectAlert,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/dashboard/overview");
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>Loading BioVault Operational Overview...</div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const attentionSamples = data?.attentionSamples || [];
  const freezers = data?.freezers || [];
  const recentActivity = data?.recentActivity || [];
  const activeAlerts = data?.activeAlerts || [];
  const { user } = useAuth();
  const role = user?.role || "technician";

  const roleMeta = {
    admin: {
      title: "Biobank Governance & Operations",
      badge: "Level 4 • Administrator Access",
      badgeClass: "badge-critical",
      subtitle: `Logged in as ${user?.name || "Admin XYZ"} • Managing institutional safety policies, staff clearances, and compliance.`,
      actions: [
        { label: "Admin Console", icon: ShieldAlert, variant: "primary", onClick: () => onNavigate("admin") },
        { label: "Storage Units", icon: Server, variant: "secondary", onClick: () => onNavigate("storage") },
        { label: `Excursion Alerts (${metrics.activeAlertsCount || 0})`, icon: AlertTriangle, variant: "secondary", onClick: () => onNavigate("alerts"), iconColor: "#f59e0b" },
        { label: "Audit Ledger", icon: ClipboardList, variant: "secondary", onClick: () => onNavigate("activity") },
      ],
    },
    technician: {
      title: "Cryogenic Storage & Specimen Intake Center",
      badge: "Level 3 • Lab Technician Access",
      badgeClass: "badge-cyan",
      subtitle: `Logged in as ${user?.name || "Technician ABC"} • Specimen intake, 2D barcoding, and cryogenic storage rack allocations.`,
      actions: [
        { label: "Register Sample", icon: Plus, variant: "primary", onClick: onOpenAddSample, stroke: 2.5 },
        { label: "Cryo Storage Grid", icon: Server, variant: "secondary", onClick: () => onNavigate("storage") },
        { label: `Thermal Alerts (${metrics.activeAlertsCount || 0})`, icon: AlertTriangle, variant: "secondary", onClick: () => onNavigate("alerts"), iconColor: "#f59e0b" },
        { label: "Expiry Watch", icon: Clock, variant: "secondary", onClick: () => onNavigate("expiry") },
      ],
    },
    researcher: {
      title: "Clinical Requisitions & Research Cohort Portal",
      badge: "Level 2 • Principal Investigator Access",
      badgeClass: "badge-purple",
      subtitle: `Logged in as ${user?.name || "Researcher PQR"} • Browse biological specimens, check stability horizons, and requisition vials for studies.`,
      actions: [
        { label: "Create Requisition", icon: ClipboardList, variant: "emerald", onClick: onOpenNewRequest },
        { label: "Browse Specimen Inventory", icon: Dna, variant: "secondary", onClick: () => onNavigate("samples") },
        { label: "Stability & Expiry Watch", icon: Clock, variant: "secondary", onClick: () => onNavigate("expiry") },
        { label: "My Access Requests", icon: ArrowRight, variant: "secondary", onClick: () => onNavigate("requests") },
      ],
    },
    auditor: {
      title: "QA Audit & Regulatory Surveillance",
      badge: "Level 1 • QA Auditor (Read-Only)",
      badgeClass: "badge-medium",
      subtitle: `Logged in as ${user?.name || "Compliance JKL"} • Tamper-evident 21 CFR Part 11 audit trails, chain-of-custody tracking, and incident logging.`,
      actions: [
        { label: "Review Audit Trail", icon: ClipboardList, variant: "primary", onClick: () => onNavigate("activity") },
        { label: "Specimen Ledger", icon: Dna, variant: "secondary", onClick: () => onNavigate("samples") },
        { label: `Recorded Excursions (${metrics.activeAlertsCount || 0})`, icon: AlertTriangle, variant: "secondary", onClick: () => onNavigate("alerts"), iconColor: "#f59e0b" },
        { label: "Expiry Forecaster", icon: Clock, variant: "secondary", onClick: () => onNavigate("expiry") },
      ],
    },
  };

  const currentRoleMeta = roleMeta[role] || roleMeta.technician;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner / Welcome & Role-Specific Action Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          background: "linear-gradient(135deg, rgba(240, 244, 248, 0.95) 0%, rgba(232, 237, 245, 0.98) 100%)",
          borderLeft:
            role === "admin"
              ? "4px solid var(--cryo-cyan)"
              : role === "researcher"
              ? "4px solid #10b981"
              : role === "technician"
              ? "4px solid #0099c8"
              : "4px solid #7c3aed",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span className={`badge ${currentRoleMeta.badgeClass}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
              {currentRoleMeta.badge}
            </span>
            <span className="status-dot status-dot-emerald" />
            <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>LIVE TELEMETRY</span>
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            {currentRoleMeta.title}
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px" }}>
            {currentRoleMeta.subtitle}
          </p>
        </div>

        {/* Quick Actions (Strictly Role-Based) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {currentRoleMeta.actions.map((act, idx) => {
            const Icon = act.icon;
            const btnClass =
              act.variant === "emerald"
                ? "btn btn-emerald"
                : act.variant === "primary"
                ? "btn btn-primary"
                : "btn btn-secondary";
            return (
              <button key={idx} className={btnClass} onClick={act.onClick}>
                <Icon size={16} color={act.iconColor} strokeWidth={act.stroke || 2} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Overview Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          title="Total Registered Samples"
          value={metrics.totalSamples || 0}
          subtitle="Active repository specimens"
          icon={Dna}
          accent="cyan"
          onClick={() => onNavigate("samples")}
        />
        <StatCard
          title="Available in Storage"
          value={metrics.availableSamples || 0}
          subtitle={`${metrics.storedSamples || 0} total stored`}
          icon={Server}
          accent="emerald"
          badge="Ready"
          onClick={() => onNavigate("samples")}
        />
        <StatCard
          title="Pending Requests"
          value={metrics.pendingRequests || 0}
          subtitle="Requisitions in lifecycle"
          icon={ClipboardList}
          accent="purple"
          onClick={() => onNavigate("requests")}
        />
        <StatCard
          title="Samples Needing Attention"
          value={metrics.highRiskSamples || 0}
          subtitle={`${metrics.urgentSamples || 0} urgent priority`}
          icon={AlertTriangle}
          accent="crimson"
          badge="High Risk"
          onClick={() => onNavigate("alerts")}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
        {/* Left Column: Samples Requiring Attention + Storage Overview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section: Samples Requiring Attention */}
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
                <ShieldAlert size={18} color="#f43f5e" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                  Samples Requiring Attention
                </h2>
                <span
                  style={{
                    background: "rgba(244, 63, 94, 0.15)",
                    color: "#f87171",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "10px",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                  }}
                >
                  {attentionSamples.length} Flagged
                </span>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.78rem" }}
                onClick={() => onNavigate("samples")}
              >
                <span>View All Samples</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {attentionSamples.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {attentionSamples.slice(0, 4).map((sample) => (
                  <div
                    key={sample.id || sample.sampleId}
                    className="glass-card"
                    onClick={() => onInspectSample(sample.sampleId)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: "rgba(255, 255, 255, 0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      borderLeft: `4px solid ${
                        sample.riskLevel === "Critical"
                          ? "#f43f5e"
                          : sample.priorityLevel === "Urgent"
                          ? "#f59e0b"
                          : "#3b82f6"
                      }`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          {sample.sampleId}
                        </span>
                        <span className="badge badge-purple" style={{ fontSize: "0.68rem" }}>
                          {sample.type}
                        </span>
                        <span
                          className={`badge ${
                            sample.riskLevel === "Critical"
                              ? "badge-critical"
                              : sample.riskLevel === "High"
                              ? "badge-high"
                              : "badge-medium"
                          }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          Risk: {sample.riskLevel}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#be123c", marginTop: "4px" }}>
                        {sample.attentionReason || "Flagged due to elevated protocol urgency or review requirement."}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px" }}>
                        Location: <strong>{sample.storageLocation?.freezerId} / {sample.storageLocation?.rack} / {sample.storageLocation?.box} / {sample.storageLocation?.position}</strong>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "0.74rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectSample(sample.sampleId);
                      }}
                    >
                      <span>Inspect</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                ✓ No high risk or urgent samples requiring immediate action.
              </div>
            )}
          </div>

          {/* Section: Storage Overview */}
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
                <Server size={18} color="#00f2fe" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                  Cryogenic Storage Telemetry
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.78rem" }}
                onClick={() => onNavigate("storage")}
              >
                <span>Storage Matrix</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {freezers.map((freezer) => {
                const occupancyRate = ((freezer.occupied / freezer.capacity) * 100).toFixed(0);
                const isWarning = freezer.status !== "Normal";

                return (
                  <div
                    key={freezer.id}
                    className="glass-card"
                    style={{
                      padding: "14px 16px",
                      background: "rgba(255, 255, 255, 0.7)",
                      border: isWarning ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {freezer.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {freezer.type}
                        </div>
                      </div>
                      <span
                        className={`badge ${isWarning ? "badge-high" : "badge-low"}`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        {freezer.status}
                      </span>
                    </div>

                    {/* Temperature Gauge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        margin: "12px 0 6px",
                      }}
                    >
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ThermometerSnowflake size={14} color="#00f2fe" />
                        Temp Reading
                      </span>
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          color: isWarning ? "#b45309" : "#0369a1",
                        }}
                      >
                        {freezer.currentTemp}°C
                      </span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                        <span>Capacity: {freezer.occupied} / {freezer.capacity}</span>
                        <span>{occupancyRate}%</span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "rgba(0, 0, 0, 0.06)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${occupancyRate}%`,
                            height: "100%",
                            background:
                              occupancyRate > 90
                                ? "#f43f5e"
                                : occupancyRate > 75
                                ? "#f59e0b"
                                : "linear-gradient(90deg, #0099c8 0%, #059669 100%)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Alerts + Recent Activity Stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Active Alerts Box */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                  Active Storage Alerts
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.78rem" }}
                onClick={() => onNavigate("alerts")}
              >
                <span>Alerts Hub</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {activeAlerts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id || alert.alertId}
                    className="glass-card"
                    onClick={() => onInspectAlert(alert)}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      background: "rgba(255, 255, 255, 0.7)",
                      borderLeft: `3px solid ${
                        alert.severity === "Critical"
                          ? "#f43f5e"
                          : alert.severity === "High"
                          ? "#f59e0b"
                          : "#3b82f6"
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {alert.title}
                      </span>
                      <span
                        className={`badge ${
                          alert.severity === "Critical" ? "badge-critical" : "badge-high"
                        }`}
                        style={{ fontSize: "0.62rem" }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {alert.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                ✓ No active alerts. All units operating within target parameters.
              </div>
            )}
          </div>

          {/* Recent Activity Audit Stream */}
          <div className="glass-panel" style={{ padding: "20px", flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} color="#10b981" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                  Recent Activity Stream
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.78rem" }}
                onClick={() => onNavigate("activity")}
              >
                <span>Full Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="glass-card"
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {act.actionLabel}
                    </span>
                    <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                    {act.description}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#0369a1", marginTop: "3px" }}>
                    Operator: <strong>{act.performedBy}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
