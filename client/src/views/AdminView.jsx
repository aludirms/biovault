import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Database,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Download,
  Search,
  Activity,
  UserCheck,
  ShieldAlert,
  Sliders,
  ChevronRight,
  X,
} from "lucide-react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export const AdminView = ({ onNavigate, onInspectSample, showToast }) => {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchStaff, setSearchStaff] = useState("");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Form State for new staff
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "biovault123",
    role: "technician",
    department: "Bio-Repository Core",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [staffRes, samplesRes] = await Promise.all([
        api.get("/auth/staff"),
        api.get("/samples"),
      ]);

      if (staffRes.success) {
        setStaff(staffRes.users || []);
      }
      if (samplesRes.success) {
        setSamples(samplesRes.samples || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      if (showToast) showToast("Error loading administrative telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/auth/staff/${userId}/role`, { role: newRole });
      if (res.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === userId || s._id === userId ? { ...s, role: newRole } : s))
        );
        if (showToast) showToast(`Role updated to ${newRole.toUpperCase()} successfully.`);
      }
    } catch (err) {
      if (showToast) showToast("Failed to update user role", "error");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) {
      if (showToast) showToast("Please provide staff name and institutional email.", "error");
      return;
    }
    setIsSubmittingStaff(true);
    try {
      const res = await api.post("/auth/register", newStaff);
      if (res.success) {
        if (showToast) showToast(`Staff account created for ${newStaff.name}.`);
        setIsAddStaffOpen(false);
        setNewStaff({
          name: "",
          email: "",
          employeeId: "",
          password: "biovault123",
          role: "technician",
          department: "Bio-Repository Core",
        });
        fetchAdminData();
      } else {
        if (showToast) showToast(res.message || "Failed to create staff account.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error registering new staff", "error");
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const exportSpecimenLedgerCSV = () => {
    if (!samples.length) {
      if (showToast) showToast("No specimens available to export.", "error");
      return;
    }
    const headers = [
      "Sample ID",
      "Donor ID",
      "Specimen Type",
      "Study",
      "Collection Date",
      "Expiry Date",
      "Quantity",
      "Unit",
      "Status",
      "Freezer",
      "Rack",
      "Box",
      "Position",
      "Risk Level",
      "Barcode",
    ];

    const rows = samples.map((s) => [
      s.sampleId,
      s.donorId,
      `"${s.type}"`,
      `"${s.study}"`,
      s.collectionDate ? s.collectionDate.slice(0, 10) : "",
      s.expiryDate ? s.expiryDate.slice(0, 10) : "",
      s.quantity,
      s.unit,
      s.status,
      `"${s.storageLocation?.freezerName || s.storageLocation?.freezerId || ""}"`,
      s.storageLocation?.rack || "",
      s.storageLocation?.box || "",
      s.storageLocation?.position || "",
      s.riskLevel,
      s.barcode || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BioVault_Specimen_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast("Specimen ledger exported to CSV successfully.");
  };

  const exportAuditLogCSV = async () => {
    try {
      const res = await api.get("/activity/logs?limit=100");
      const logs = res.logs || [];
      if (!logs.length) {
        if (showToast) showToast("No audit logs to export.", "error");
        return;
      }
      const headers = ["Log ID", "Action", "Operator", "Role", "Description", "Location", "Timestamp"];
      const rows = logs.map((l) => [
        l.id || l._id,
        `"${l.actionLabel || l.actionType}"`,
        `"${l.performedBy}"`,
        `"${l.role}"`,
        `"${(l.description || "").replace(/"/g, '""')}"`,
        `"${l.location || ""}"`,
        l.timestamp,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `BioVault_Regulatory_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (showToast) showToast("Regulatory audit trail exported to CSV.");
    } catch (err) {
      if (showToast) showToast("Failed to export audit logs", "error");
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchStaff.toLowerCase())
  );

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
          borderLeft: "4px solid var(--cryo-cyan)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                background: "rgba(0, 153, 200, 0.12)",
                color: "#0369a1",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Control Center
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="status-dot status-dot-emerald" /> RBAC Enforced • ISO 20387 Biobanking Standards
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Biobank Administration & Governance
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Manage authorized staff access, institutional storage safety policies, system telemetry, and compliance ledgers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={exportSpecimenLedgerCSV}
            className="btn btn-secondary"
            style={{ fontSize: "0.84rem", padding: "8px 14px" }}
            title="Download full inventory as CSV"
          >
            <Download size={15} />
            Export Inventory CSV
          </button>
          <button
            onClick={exportAuditLogCSV}
            className="btn btn-secondary"
            style={{ fontSize: "0.84rem", padding: "8px 14px" }}
            title="Export 21 CFR Part 11 Audit Trail"
          >
            <FileSpreadsheet size={15} />
            Export Audit Trail
          </button>
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: "0.84rem", padding: "8px 16px" }}
          >
            <Plus size={16} />
            Register Staff
          </button>
        </div>
      </div>

      {/* Governance & Health Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Authorized Personnel
            </span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(0, 153, 200, 0.12)",
                color: "#0369a1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {staff.length} Active Staff
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            4 Clinical Security Roles Configured
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Compliance Integrity
            </span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(5, 150, 105, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669" }}>
            100% GCLP
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Full Chain-of-Custody Tracing Active
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Data Persistence Architecture
            </span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(124, 58, 237, 0.12)",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
            Dual-Mode Engine
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Mongoose Schemas + In-Memory Failover
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Storage Safety Protocols
            </span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(217, 119, 6, 0.12)",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sliders size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
            -70°C Alarm
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Auto-incident alert on thermal breach
          </div>
        </div>
      </div>

      {/* Main Section: Staff Management & System Policies */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Left Column: Personnel Roster */}
        <div className="glass-panel" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Staff Access & Clearance Roster
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Role-Based Access Control (RBAC) authorization matrix
              </p>
            </div>

            <div style={{ position: "relative", width: "220px" }}>
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
                placeholder="Filter staff..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: "30px", height: "34px", fontSize: "0.82rem" }}
              />
            </div>
          </div>

          <div className="bio-table-container">
            <table className="bio-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Assigned Role</th>
                  <th>Role Permission</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id || member._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #0099c8, #2563eb)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {member.avatar || member.name?.slice(0, 2).toUpperCase() || "ST"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.88rem" }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {member.employeeId || "BV-EMP-CORE"}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {member.department || "Bio-Repository Core"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          member.role === "admin"
                            ? "badge-critical"
                            : member.role === "technician"
                            ? "badge-cyan"
                            : member.role === "researcher"
                            ? "badge-purple"
                            : "badge-medium"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {member.roleLabel || member.role}
                      </span>
                    </td>
                    <td>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id || member._id, e.target.value)}
                        className="glass-select"
                        style={{ padding: "4px 8px", fontSize: "0.78rem", height: "30px" }}
                      >
                        <option value="admin">Admin (Full Control)</option>
                        <option value="technician">Technician (Storage & Custody)</option>
                        <option value="researcher">Researcher (Requisitions)</option>
                        <option value="auditor">Auditor (Read & Compliance)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: System Governance & Quick Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* System Architecture Card */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Server size={16} color="var(--cryo-cyan)" /> System Health & Connectivity
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Backend Engine</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Node.js / Express 5.2.1</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Data Store Engine</span>
                <span style={{ fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span className="status-dot status-dot-emerald" /> In-Memory Failover Active
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Mongoose Models</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>6 Schemas Mounted</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Response Latency</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>&lt; 3ms</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Security Protocols</span>
                <span style={{ fontWeight: 600, color: "#2563eb" }}>JWT Bearer 7-Day</span>
              </div>
            </div>
          </div>

          {/* Cryo Policy Rules */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={16} color="#d97706" /> Cryo-Safety Thresholds
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.6)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Ultra-Low Freezers (F01–F03)</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>
                  Target: -80°C | Warning: &gt; -75°C | Critical: &gt; -65°C
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.6)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>LN2 Cryo-Vessel (F04)</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>
                  Target: -196°C | Warning: &gt; -185°C | Critical: &gt; -175°C
                </div>
              </div>

              <div style={{ background: "rgba(5, 150, 105, 0.08)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <div style={{ fontWeight: 600, color: "#047857" }}>Automated Specimen Quarantine</div>
                <div style={{ color: "#065f46", fontSize: "0.75rem", marginTop: "2px" }}>
                  Active: Automatically isolates specimens if a freezer remains in Critical state for &gt; 30 mins.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump to Expiry Forecaster */}
          <div
            className="glass-card"
            style={{
              padding: "18px",
              cursor: "pointer",
              border: "1px solid var(--cryo-cyan-glow)",
              background: "linear-gradient(135deg, rgba(0, 153, 200, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
            }}
            onClick={() => onNavigate && onNavigate("expiry")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0369a1" }}>
                  Expiry & Stability Forecaster →
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Surveillance of specimens approaching 30/60/90 day viability limits
                </div>
              </div>
              <ChevronRight size={18} color="#0369a1" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Register Staff */}
      {isAddStaffOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsAddStaffOpen(false)}>
          <div
            className="modal-card"
            style={{ width: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(0, 153, 200, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--cryo-cyan)",
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Register New Personnel
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Issue clinical repository access credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="btn-ghost"
                style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jordan Hayes"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jhayes@biovault.org"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Employee / Badge ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BV-EMP-401"
                    value={newStaff.employeeId}
                    onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Molecular Pathology"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Security Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="glass-select"
                    style={{ width: "100%" }}
                  >
                    <option value="technician">Lab Technician</option>
                    <option value="researcher">Principal Investigator</option>
                    <option value="auditor">QA Compliance Auditor</option>
                    <option value="admin">Biobank Administrator</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Default Password
                  </label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmittingStaff}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingStaff}
                >
                  {isSubmittingStaff ? "Registering..." : "Authorize Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
