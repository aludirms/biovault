import React, { useState, useEffect } from "react";
import {
  Dna,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Printer,
  ClipboardList,
  Eye,
  ShieldAlert,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { api } from "../api/apiClient";

export const SamplesView = ({
  onOpenAddSample,
  onInspectSample,
  onOpenNewRequest,
  onPrintLabel,
  initialSearch = "",
}) => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [freezerFilter, setFreezerFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchSamples();
  }, [search, typeFilter, statusFilter, riskFilter, priorityFilter, freezerFilter, sortBy, sortOrder]);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter !== "All") params.append("type", typeFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (riskFilter !== "All") params.append("riskLevel", riskFilter);
      if (priorityFilter !== "All") params.append("priorityLevel", priorityFilter);
      if (freezerFilter !== "All") params.append("freezerId", freezerFilter);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await api.get(`/samples?${params.toString()}`);
      if (res.success) {
        setSamples(res.samples || []);
      }
    } catch (err) {
      console.error("Samples fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setRiskFilter("All");
    setPriorityFilter("All");
    setFreezerFilter("All");
  };

  const sampleTypes = [
    "All",
    "DNA Extract",
    "RNA Extract",
    "Biopsy Tissue",
    "Whole Blood",
    "Blood Serum",
    "Blood Plasma",
    "PBMC",
    "Cell Line",
    "Synovial Fluid",
    "Urine",
  ];

  const getTypeStyleClass = (type) => {
    switch (type) {
      case "DNA Extract":
        return "type-dna";
      case "RNA Extract":
        return "type-rna";
      case "Biopsy Tissue":
        return "type-tissue";
      case "Whole Blood":
        return "type-blood";
      case "Blood Plasma":
        return "type-plasma";
      case "Cell Line":
        return "type-cell";
      case "PBMC":
        return "type-pbmc";
      case "Synovial Fluid":
        return "type-synovial";
      case "Urine":
        return "type-urine";
      default:
        return "type-dna";
    }
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case "Critical":
        return "badge-critical";
      case "High":
        return "badge-high";
      case "Medium":
        return "badge-medium";
      default:
        return "badge-low";
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case "Urgent":
        return "badge-critical";
      case "High":
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
              Biological Specimen Inventory
            </h1>
            <span
              style={{
                background: "rgba(0, 153, 200, 0.1)",
                color: "#0369a1",
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid rgba(0, 242, 254, 0.25)",
              }}
            >
              {samples.length} Specimens
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Filter, search, trace storage location, and inspect specimen quality parameters.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddSample}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Register New Specimen</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Top Filter Row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Main Search Input */}
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
              placeholder="Search by Sample ID, Donor ID, Study, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sample Type Filter */}
          <select
            className="glass-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {sampleTypes.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Types" : t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="glass-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Stored">Stored</option>
            <option value="In-Transit">In-Transit</option>
            <option value="Retrieved">Retrieved</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Disposed">Disposed</option>
          </select>

          {/* Risk Level Filter */}
          <select
            className="glass-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          {/* Priority Level Filter */}
          <select
            className="glass-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Standard">Standard Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>

          {/* Freezer Filter */}
          <select
            className="glass-select"
            value={freezerFilter}
            onChange={(e) => setFreezerFilter(e.target.value)}
          >
            <option value="All">All Freezers</option>
            <option value="F01">F01 (Alpha -80°C)</option>
            <option value="F02">F02 (Beta -196°C)</option>
            <option value="F03">F03 (Gamma -20°C)</option>
            <option value="F04">F04 (Delta +4°C)</option>
          </select>

          {/* Reset Filters */}
          {(search || typeFilter !== "All" || statusFilter !== "All" || riskFilter !== "All" || priorityFilter !== "All" || freezerFilter !== "All") && (
            <button
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ padding: "8px 12px", fontSize: "0.78rem" }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bio-table-container">
        <table className="bio-table">
          <thead>
            <tr>
              <th>Sample ID / Barcode</th>
              <th>Type</th>
              <th>Donor ID</th>
              <th>Associated Study</th>
              <th>Quantity</th>
              <th>Physical Storage Slot</th>
              <th>Condition</th>
              <th>Risk / Priority</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Loading biological inventory...
                </td>
              </tr>
            ) : samples.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No specimens found matching the active search or filter criteria.
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr key={sample.id || sample.sampleId} onClick={() => onInspectSample(sample.sampleId)}>
                  {/* Sample ID */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          background: "rgba(0, 153, 200, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0099c8",
                        }}
                      >
                        <Dna size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                          {sample.sampleId}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          {sample.barcode || "No Barcode"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span className={`badge ${getTypeStyleClass(sample.type)}`}>
                      {sample.type}
                    </span>
                  </td>

                  {/* Donor ID */}
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {sample.donorId}
                    </span>
                  </td>

                  {/* Study */}
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      {sample.study}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0099c8" }}>
                      {sample.quantity} {sample.unit}
                    </span>
                  </td>

                  {/* Storage Slot */}
                  <td>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "rgba(248, 250, 252, 0.9)",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        border: "1px solid var(--border-subtle)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <strong style={{ color: "#0099c8" }}>{sample.storageLocation?.freezerId}</strong>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span>{sample.storageLocation?.rack}</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <span>{sample.storageLocation?.box}</span>
                      <span style={{ color: "var(--text-muted)" }}>/</span>
                      <strong style={{ color: "#10b981" }}>{sample.storageLocation?.position}</strong>
                    </div>
                  </td>

                  {/* Condition */}
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
                      {sample.currentCondition}
                    </span>
                  </td>

                  {/* Risk / Priority */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span className={`badge ${getRiskBadgeClass(sample.riskLevel)}`} style={{ fontSize: "0.65rem" }}>
                        Risk: {sample.riskLevel}
                      </span>
                      {sample.priorityLevel !== "Standard" && (
                        <span className={`badge ${getPriorityBadgeClass(sample.priorityLevel)}`} style={{ fontSize: "0.65rem" }}>
                          {sample.priorityLevel}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 8px" }}
                        title="Print Cryo Tag"
                        onClick={() => onPrintLabel(sample)}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 8px" }}
                        title="Create Request"
                        onClick={() => onOpenNewRequest(sample)}
                      >
                        <ClipboardList size={14} />
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 10px", fontSize: "0.76rem" }}
                        onClick={() => onInspectSample(sample.sampleId)}
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
