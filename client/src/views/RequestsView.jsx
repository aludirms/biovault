import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { api } from "../api/apiClient";

export const RequestsView = ({ onOpenNewRequest, onInspectRequest }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (priorityFilter !== "All") params.append("priority", priorityFilter);

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Requested":
        return <span className="badge badge-purple">1. Requested</span>;
      case "Approved":
        return <span className="badge badge-cyan">2. Approved</span>;
      case "Retrieval In Progress":
        return <span className="badge badge-high">3. In Retrieval</span>;
      case "Retrieved":
        return <span className="badge badge-medium">4. Retrieved</span>;
      case "Returned":
        return <span className="badge badge-low">5. Returned</span>;
      case "Rejected":
        return <span className="badge badge-critical">Rejected</span>;
      default:
        return <span className="badge badge-cyan">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return <span className="badge badge-critical">Urgent</span>;
      case "High":
        return <span className="badge badge-high">High</span>;
      default:
        return <span className="badge badge-low">Normal</span>;
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
              Specimen Requisitions & Custody Transfers
            </h1>
            <span
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                color: "#c084fc",
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              {requests.length} Requests
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track sample requests across approval, retrieval, researcher handover, and storage return.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewRequest}>
          <Plus size={16} strokeWidth={2.5} />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Filter / Tabs Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search by Request ID, Sample ID, Requester, or Study..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="glass-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Lifecycle Statuses</option>
          <option value="Requested">Requested (Pending Approval)</option>
          <option value="Approved">Approved (Ready for Retrieval)</option>
          <option value="Retrieval In Progress">Retrieval In Progress</option>
          <option value="Retrieved">Retrieved (Handed Over)</option>
          <option value="Returned">Returned (Completed)</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Priority Filter */}
        <select
          className="glass-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {(search || statusFilter !== "All" || priorityFilter !== "All") && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPriorityFilter("All");
            }}
            style={{ padding: "8px 12px", fontSize: "0.78rem" }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="bio-table-container">
        <table className="bio-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Requested Specimen</th>
              <th>Requester & Department</th>
              <th>Study Purpose</th>
              <th>Quantity</th>
              <th>Storage Location</th>
              <th>Priority</th>
              <th>Status / Stage</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Loading requisitions...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No requisitions found matching the active filters.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id || req.requestId} onClick={() => onInspectRequest(req)}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "#c084fc" }}>
                      {req.requestId}
                    </span>
                  </td>

                  <td>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {req.sampleId}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {req.sampleType}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {req.requesterName}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {req.department}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {req.studyPurpose}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0099c8" }}>
                      {req.quantityRequested} {req.unit}
                    </span>
                  </td>

                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        background: "rgba(248, 250, 252, 0.9)",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {req.storageLocation || "F01 / R01 / B01 / A1"}
                    </span>
                  </td>

                  <td>{getPriorityBadge(req.priority)}</td>

                  <td>{getStatusBadge(req.status)}</td>

                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "6px 12px", fontSize: "0.76rem" }}
                      onClick={() => onInspectRequest(req)}
                    >
                      <Eye size={14} />
                      <span>Manage Workflow</span>
                    </button>
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
