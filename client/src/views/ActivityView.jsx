import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  Dna,
  Clock,
  User,
  MapPin,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Layers,
} from "lucide-react";
import { api } from "../api/apiClient";

export const ActivityView = ({ onInspectSample, initialSampleId = "" }) => {
  const [activeTab, setActiveTab] = useState(initialSampleId ? "custody" : "activity");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  // Chain of Custody state
  const [custodySampleId, setCustodySampleId] = useState(initialSampleId || "BV-2026-0842");
  const [custodyData, setCustodyData] = useState(null);
  const [custodyLoading, setCustodyLoading] = useState(false);
  const [custodyError, setCustodyError] = useState("");

  useEffect(() => {
    fetchActivityLogs();
  }, [search, actionFilter]);

  useEffect(() => {
    if (custodySampleId) {
      fetchChainOfCustody(custodySampleId);
    }
  }, [custodySampleId]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (actionFilter !== "All") params.append("actionType", actionFilter);

      const res = await api.get(`/activity/logs?${params.toString()}`);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChainOfCustody = async (sId) => {
    setCustodyLoading(true);
    setCustodyError("");
    try {
      const res = await api.get(`/activity/custody/${sId}`);
      if (res.success) {
        setCustodyData(res);
      }
    } catch (err) {
      setCustodyError(err.message || "Failed to load custody trace.");
      setCustodyData(null);
    } finally {
      setCustodyLoading(false);
    }
  };

  const handleCustodySearchSubmit = (e) => {
    e.preventDefault();
    if (custodySampleId.trim()) {
      fetchChainOfCustody(custodySampleId.trim());
    }
  };

  const actionTypes = [
    "All",
    "REGISTER",
    "UPDATE",
    "LOCATION_TRANSFER",
    "REQUEST_CREATED",
    "REQUEST_APPROVED",
    "SAMPLE_RETRIEVED",
    "SAMPLE_HANDOVER",
    "SAMPLE_RETURNED",
    "ALERT_GENERATED",
    "ALERT_RESOLVED",
    "DISPOSAL",
  ];

  const getActionBadge = (type) => {
    switch (type) {
      case "REGISTER":
        return <span className="badge badge-low">Registered</span>;
      case "LOCATION_TRANSFER":
        return <span className="badge badge-cyan">Relocated</span>;
      case "REQUEST_CREATED":
        return <span className="badge badge-purple">Request</span>;
      case "REQUEST_APPROVED":
        return <span className="badge badge-cyan">Approved</span>;
      case "SAMPLE_RETRIEVED":
        return <span className="badge badge-high">Retrieved</span>;
      case "SAMPLE_HANDOVER":
        return <span className="badge badge-medium">Handover</span>;
      case "SAMPLE_RETURNED":
        return <span className="badge badge-low">Returned</span>;
      case "ALERT_GENERATED":
        return <span className="badge badge-critical">Alert</span>;
      case "ALERT_RESOLVED":
        return <span className="badge badge-low">Resolved</span>;
      default:
        return <span className="badge badge-purple">{type}</span>;
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
              Audit Log & Chain of Custody
            </h1>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              Auditable Compliance Trail
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Maintain full chronological tracking of specimen registration, approvals, handovers, and returns.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`btn ${activeTab === "activity" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "7px 14px", fontSize: "0.82rem" }}
            onClick={() => setActiveTab("activity")}
          >
            <History size={15} />
            <span>Activity Log</span>
          </button>
          <button
            className={`btn ${activeTab === "custody" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "7px 14px", fontSize: "0.82rem" }}
            onClick={() => setActiveTab("custody")}
          >
            <Clock size={15} />
            <span>Chain of Custody Timeline</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Chronological Activity Log */}
      {activeTab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search & Action Filter Bar */}
          <div
            className="glass-panel"
            style={{
              padding: "14px 20px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
              <Search
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
                type="text"
                className="glass-input"
                style={{ paddingLeft: "36px" }}
                placeholder="Search audit trail by Sample ID, Request ID, Operator, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="glass-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {actionTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Action Types" : t}
                </option>
              ))}
            </select>

            {(search || actionFilter !== "All") && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch("");
                  setActionFilter("All");
                }}
                style={{ padding: "8px 12px", fontSize: "0.78rem" }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Activity Log Table */}
          <div className="bio-table-container">
            <table className="bio-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Sample ID / Target</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Operator & Role</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Loading audit log records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No audit events found matching the active criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td>{getActionBadge(log.actionType)}</td>

                      <td>
                        {log.sampleId ? (
                          <button
                            onClick={() => onInspectSample(log.sampleId)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#0099c8",
                              fontWeight: 700,
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                              textDecoration: "underline",
                              fontSize: "0.82rem",
                            }}
                          >
                            {log.sampleId}
                          </button>
                        ) : log.requestId ? (
                          <span style={{ color: "#c084fc", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                            {log.requestId}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          {log.description}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {log.location || "-"}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                            {log.performedBy}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            {log.role}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Chain of Custody Visual Timeline */}
      {activeTab === "custody" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sample Search Form for Custody Trace */}
          <div
            className="glass-panel"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <form
              onSubmit={handleCustodySearchSubmit}
              style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, minWidth: "280px" }}
            >
              <div style={{ position: "relative", flex: 1 }}>
                <Dna
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0099c8",
                  }}
                />
                <input
                  type="text"
                  className="glass-input"
                  style={{ paddingLeft: "36px", fontFamily: "var(--font-mono)", fontWeight: 700 }}
                  placeholder="Enter Specimen ID (e.g. BV-2026-0842)..."
                  value={custodySampleId}
                  onChange={(e) => setCustodySampleId(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={custodyLoading}>
                <span>Inspect Chain of Custody</span>
              </button>
            </form>

            <div style={{ display: "flex", gap: "6px" }}>
              {["BV-2026-0842", "BV-2026-0847", "BV-2026-0849"].map((sId) => (
                <button
                  key={sId}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}
                  onClick={() => setCustodySampleId(sId)}
                >
                  {sId}
                </button>
              ))}
            </div>
          </div>

          {/* Custody Timeline Result */}
          {custodyLoading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Tracing specimen custody trail...
            </div>
          ) : custodyError ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#f87171", fontSize: "0.85rem" }}>
              {custodyError}
            </div>
          ) : custodyData?.sample ? (
            <div className="glass-panel" style={{ padding: "24px" }}>
              {/* Specimen Header Overview */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(248, 250, 252, 0.9)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0099c8", fontFamily: "var(--font-mono)" }}>
                      {custodyData.sample.sampleId}
                    </span>
                    <span className="badge badge-purple">{custodyData.sample.type}</span>
                    <span className="badge badge-low">{custodyData.sample.status}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Study: <strong>{custodyData.sample.study}</strong> • Donor: {custodyData.sample.donorId} • Initial Condition: {custodyData.sample.initialCondition}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>CURRENT PHYSICAL SLOT</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                    {custodyData.sample.storageLocation?.freezerId} / {custodyData.sample.storageLocation?.rack} / {custodyData.sample.storageLocation?.box} / {custodyData.sample.storageLocation?.position}
                  </div>
                </div>
              </div>

              {/* Visual Vertical Timeline */}
              <div style={{ position: "relative", paddingLeft: "32px" }}>
                {/* Vertical connecting neon bar */}
                <div
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "14px",
                    bottom: "20px",
                    width: "3px",
                    background: "linear-gradient(180deg, #0099c8 0%, #059669 100%)",
                    boxShadow: "0 0 10px rgba(0, 242, 254, 0.4)",
                  }}
                />

                {custodyData.timeline.map((event, idx) => (
                  <div key={idx} style={{ position: "relative", marginBottom: "24px" }}>
                    {/* Glowing Node */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-32px",
                        top: "4px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#f0f4f8",
                        border: "3px solid #00f2fe",
                        boxShadow: "0 0 12px rgba(0, 242, 254, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f2fe" }} />
                    </div>

                    {/* Event Card */}
                    <div
                      className="glass-card"
                      style={{
                        padding: "16px 20px",
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid var(--border-medium)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                            {event.stage}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>
                            Step {idx + 1}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.45" }}>
                        {event.details}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "12px",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "0.74rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--bio-emerald)" }}>
                          <ShieldCheck size={14} />
                          <span>Custody Handler: <strong>{event.operator}</strong> ({event.role})</span>
                        </div>

                        {event.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            <MapPin size={13} color="#00f2fe" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Enter a specimen ID above to visualize its complete chain of custody timeline.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
