import React, { useState, useEffect } from "react";
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Download,
  Dna,
  RefreshCw,
  CheckCircle2,
  Hourglass,
  Flame,
  ThermometerSnowflake,
  ClipboardList,
} from "lucide-react";
import { api } from "../api/apiClient";

export const ExpiryDashboardView = ({
  onInspectSample,
  onOpenNewRequest,
  onNavigate,
  showToast,
}) => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHorizon, setActiveHorizon] = useState("all"); // 'all', 'critical', 'imminent', 'moderate', 'stable'
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const res = await api.get("/samples");
      if (res.success) {
        setSamples(res.samples || []);
      }
    } catch (err) {
      console.error("Error fetching samples for expiry view:", err);
      if (showToast) showToast("Failed to fetch specimen inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper: compute days remaining relative to current date
  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 999;
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Helper: calculate shelf-life elapsed percentage
  const getShelfLifeElapsed = (collectionDateStr, expiryDateStr) => {
    if (!collectionDateStr || !expiryDateStr) return 50;
    const start = new Date(collectionDateStr).getTime();
    const end = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    if (end <= start) return 100;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  // Categorize sample into time horizons
  const categorizeHorizon = (days) => {
    if (days <= 30) return "critical"; // < 30 days or already overdue
    if (days <= 60) return "imminent"; // 31-60 days
    if (days <= 90) return "moderate"; // 61-90 days
    return "stable"; // > 90 days
  };

  // Process and enrich samples
  const enrichedSamples = samples.map((s) => {
    const days = getDaysRemaining(s.expiryDate);
    const elapsedPct = getShelfLifeElapsed(s.collectionDate, s.expiryDate);
    const horizon = categorizeHorizon(days);
    return {
      ...s,
      daysRemaining: days,
      shelfLifeElapsedPct: elapsedPct,
      horizon,
    };
  });

  // Horizon Counts
  const counts = {
    all: enrichedSamples.length,
    critical: enrichedSamples.filter((s) => s.horizon === "critical").length,
    imminent: enrichedSamples.filter((s) => s.horizon === "imminent").length,
    moderate: enrichedSamples.filter((s) => s.horizon === "moderate").length,
    stable: enrichedSamples.filter((s) => s.horizon === "stable").length,
  };

  // Filter list
  const filteredSamples = enrichedSamples
    .filter((s) => {
      if (activeHorizon !== "all" && s.horizon !== activeHorizon) return false;
      if (selectedType !== "All" && s.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.sampleId.toLowerCase().includes(q) ||
          s.donorId.toLowerCase().includes(q) ||
          s.study.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          (s.storageLocation?.freezerName && s.storageLocation.freezerName.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const sampleTypes = ["All", ...new Set(samples.map((s) => s.type).filter(Boolean))];

  const exportExpiryCSV = () => {
    if (!filteredSamples.length) {
      if (showToast) showToast("No samples match current horizon filter.", "error");
      return;
    }
    const headers = [
      "Sample ID",
      "Specimen Type",
      "Donor ID",
      "Study",
      "Collection Date",
      "Expiry Date",
      "Days Remaining",
      "Horizon Category",
      "Viability Consumed (%)",
      "Storage Location",
      "Condition",
      "Status",
    ];

    const rows = filteredSamples.map((s) => [
      s.sampleId,
      `"${s.type}"`,
      s.donorId,
      `"${s.study}"`,
      s.collectionDate ? s.collectionDate.slice(0, 10) : "",
      s.expiryDate ? s.expiryDate.slice(0, 10) : "",
      s.daysRemaining,
      s.horizon.toUpperCase(),
      `${s.shelfLifeElapsedPct}%`,
      `"${s.storageLocation?.freezerName || ""} - ${s.storageLocation?.rack || ""}/${s.storageLocation?.box || ""}/${s.storageLocation?.position || ""}"`,
      `"${s.currentCondition || s.initialCondition || ""}"`,
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BioVault_Expiry_Risk_${activeHorizon.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast("Expiry risk report exported to CSV.");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "18px",
          borderLeft: "4px solid #f59e0b",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                background: "rgba(217, 119, 6, 0.12)",
                color: "#b45309",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Predictive Cryo-Surveillance
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Multi-Horizon Specimen Shelf-Life & Stability Tracker
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Specimen Stability & Expiry Forecaster
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Monitor specimen degradation velocity, forecast 30/60/90-day expiration horizons, and mitigate sample waste.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={exportExpiryCSV}
            className="btn btn-secondary"
            style={{ fontSize: "0.84rem", padding: "8px 14px" }}
          >
            <Download size={15} />
            Export Forecast CSV
          </button>
          <button
            onClick={fetchSamples}
            className="btn btn-secondary"
            style={{ fontSize: "0.84rem", padding: "8px 12px" }}
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 4 Time-Horizon Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Critical / Overdue (< 30 Days) */}
        <div
          className="glass-card"
          onClick={() => setActiveHorizon("critical")}
          style={{
            padding: "18px 20px",
            cursor: "pointer",
            border: activeHorizon === "critical" ? "2px solid #e11d48" : "1px solid var(--border-subtle)",
            boxShadow: activeHorizon === "critical" ? "0 0 16px rgba(225, 29, 72, 0.2)" : "none",
            transition: "all var(--transition-fast)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#e11d48", fontWeight: 700, textTransform: "uppercase" }}>
              Critical (&lt; 30 Days / Overdue)
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(225, 29, 72, 0.12)",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#e11d48" }}>
            {counts.critical} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Specimens</span>
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Action: Immediate quarantine or research allocation
          </div>
        </div>

        {/* Imminent (31 - 60 Days) */}
        <div
          className="glass-card"
          onClick={() => setActiveHorizon("imminent")}
          style={{
            padding: "18px 20px",
            cursor: "pointer",
            border: activeHorizon === "imminent" ? "2px solid #d97706" : "1px solid var(--border-subtle)",
            boxShadow: activeHorizon === "imminent" ? "0 0 16px rgba(217, 119, 6, 0.2)" : "none",
            transition: "all var(--transition-fast)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: 700, textTransform: "uppercase" }}>
              Imminent (31 – 60 Days)
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(217, 119, 6, 0.12)",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#d97706" }}>
            {counts.imminent} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Specimens</span>
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Action: Flag for investigator priority requisition
          </div>
        </div>

        {/* Moderate (61 - 90 Days) */}
        <div
          className="glass-card"
          onClick={() => setActiveHorizon("moderate")}
          style={{
            padding: "18px 20px",
            cursor: "pointer",
            border: activeHorizon === "moderate" ? "2px solid #2563eb" : "1px solid var(--border-subtle)",
            boxShadow: activeHorizon === "moderate" ? "0 0 16px rgba(37, 99, 235, 0.2)" : "none",
            transition: "all var(--transition-fast)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>
              Moderate (61 – 90 Days)
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(37, 99, 235, 0.12)",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Hourglass size={18} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2563eb" }}>
            {counts.moderate} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Specimens</span>
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Action: Viability surveillance nominal; schedule review
          </div>
        </div>

        {/* Stable (> 90 Days) */}
        <div
          className="glass-card"
          onClick={() => setActiveHorizon("stable")}
          style={{
            padding: "18px 20px",
            cursor: "pointer",
            border: activeHorizon === "stable" ? "2px solid #059669" : "1px solid var(--border-subtle)",
            boxShadow: activeHorizon === "stable" ? "0 0 16px rgba(5, 150, 105, 0.2)" : "none",
            transition: "all var(--transition-fast)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 700, textTransform: "uppercase" }}>
              Cryo-Stable (&gt; 90 Days)
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(5, 150, 105, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#059669" }}>
            {counts.stable} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Specimens</span>
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Long-term preservation stability nominal
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Horizon Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Horizons (${counts.all})` },
            { id: "critical", label: `Urgent < 30d (${counts.critical})`, color: "#e11d48" },
            { id: "imminent", label: `31–60d (${counts.imminent})`, color: "#d97706" },
            { id: "moderate", label: `61–90d (${counts.moderate})`, color: "#2563eb" },
            { id: "stable", label: `Stable > 90d (${counts.stable})`, color: "#059669" },
          ].map((tab) => {
            const isActive = activeHorizon === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveHorizon(tab.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: isActive ? "1px solid rgba(0, 153, 200, 0.4)" : "1px solid var(--border-subtle)",
                  background: isActive ? "rgba(0, 153, 200, 0.12)" : "rgba(255, 255, 255, 0.7)",
                  color: isActive ? "#0369a1" : "var(--text-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Type Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "210px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search sample, study..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: "30px", height: "34px", fontSize: "0.82rem" }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="glass-select"
            style={{ height: "34px", fontSize: "0.82rem" }}
          >
            {sampleTypes.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Specimen Types" : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specimen Expiry Table / Ledger */}
      <div className="bio-table-container">
        <table className="bio-table">
          <thead>
            <tr>
              <th>Specimen ID & Type</th>
              <th>Cryo Location</th>
              <th>Collection Date</th>
              <th>Expiry Date</th>
              <th>Time Remaining</th>
              <th>Viability Life Consumed</th>
              <th>Clinical Protocol</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No specimens match the selected expiration horizon.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample) => {
                const isOverdue = sample.daysRemaining <= 0;
                const isUrgent = sample.daysRemaining > 0 && sample.daysRemaining <= 30;
                const isImminent = sample.daysRemaining > 30 && sample.daysRemaining <= 60;
                const isModerate = sample.daysRemaining > 60 && sample.daysRemaining <= 90;

                return (
                  <tr key={sample.sampleId} onClick={() => onInspectSample && onInspectSample(sample.sampleId)}>
                    {/* ID & Type */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          {sample.sampleId}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                          <span
                            className={`badge ${
                              sample.type.includes("DNA")
                                ? "type-dna"
                                : sample.type.includes("Tissue")
                                ? "type-tissue"
                                : sample.type.includes("Blood")
                                ? "type-blood"
                                : sample.type.includes("RNA")
                                ? "type-rna"
                                : "badge-medium"
                            }`}
                            style={{ fontSize: "0.68rem" }}
                          >
                            {sample.type}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {sample.donorId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {sample.storageLocation?.freezerName || sample.storageLocation?.freezerId || "Unknown"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Rack {sample.storageLocation?.rack || "–"} • Box {sample.storageLocation?.box || "–"} • Slot {sample.storageLocation?.position || "–"}
                      </div>
                    </td>

                    {/* Collection Date */}
                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {sample.collectionDate ? sample.collectionDate.slice(0, 10) : "–"}
                    </td>

                    {/* Expiry Date */}
                    <td style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {sample.expiryDate ? sample.expiryDate.slice(0, 10) : "–"}
                    </td>

                    {/* Time Remaining Pill */}
                    <td>
                      {isOverdue ? (
                        <span
                          className="badge badge-critical"
                          style={{ fontSize: "0.74rem", animation: "blink 1.5s infinite" }}
                        >
                          EXPIRED ({Math.abs(sample.daysRemaining)}d ago)
                        </span>
                      ) : isUrgent ? (
                        <span className="badge badge-critical" style={{ fontSize: "0.74rem" }}>
                          {sample.daysRemaining} Days Left
                        </span>
                      ) : isImminent ? (
                        <span className="badge badge-high" style={{ fontSize: "0.74rem" }}>
                          {sample.daysRemaining} Days Left
                        </span>
                      ) : isModerate ? (
                        <span className="badge badge-medium" style={{ fontSize: "0.74rem" }}>
                          {sample.daysRemaining} Days Left
                        </span>
                      ) : (
                        <span className="badge badge-low" style={{ fontSize: "0.74rem" }}>
                          {sample.daysRemaining} Days Left
                        </span>
                      )}
                    </td>

                    {/* Viability Consumed Progress Bar */}
                    <td style={{ width: "160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            flex: 1,
                            height: "7px",
                            background: "rgba(0, 0, 0, 0.08)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${sample.shelfLifeElapsedPct}%`,
                              height: "100%",
                              borderRadius: "4px",
                              background:
                                sample.shelfLifeElapsedPct > 90
                                  ? "#e11d48"
                                  : sample.shelfLifeElapsedPct > 70
                                  ? "#d97706"
                                  : "#059669",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            width: "32px",
                            textAlign: "right",
                          }}
                        >
                          {sample.shelfLifeElapsedPct}%
                        </span>
                      </div>
                    </td>

                    {/* Clinical Protocol */}
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color:
                            isOverdue || isUrgent
                              ? "#be123c"
                              : isImminent
                              ? "#b45309"
                              : isModerate
                              ? "#1d4ed8"
                              : "#047857",
                        }}
                      >
                        {isOverdue
                          ? "Quarantine & Disposal Review"
                          : isUrgent
                          ? "Prioritize Immediate Requisition"
                          : isImminent
                          ? "Flag for Clinical Study Allocation"
                          : isModerate
                          ? "Viability Surveillance Nominal"
                          : "Cryo-Stable"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => onInspectSample && onInspectSample(sample.sampleId)}
                          className="btn-ghost"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          title="View Sample Details"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onOpenNewRequest && onOpenNewRequest(sample)}
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                          title="Initiate Sample Requisition"
                        >
                          Request
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
