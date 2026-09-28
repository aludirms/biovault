import React, { useState } from "react";
import {
  X,
  ClipboardList,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Building,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  XCircle,
  Play,
  Send,
} from "lucide-react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export const RequestDetailsDrawer = ({ request, onClose, onRequestUpdated }) => {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null); // 'approve', 'retrieve', 'handover', 'return', 'reject'
  const [notes, setNotes] = useState("");
  const [handoverTo, setHandoverTo] = useState(request?.requesterName || "");
  const [rejectionReason, setRejectionReason] = useState("");

  if (!request) return null;

  const stages = [
    "Requested",
    "Approved",
    "Retrieval In Progress",
    "Retrieved",
    "Returned",
  ];

  const currentStageIndex = stages.indexOf(request.status);
  const isRejected = request.status === "Rejected";

  const handleExecuteTransition = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/requests/${request.requestId}/status`, {
        newStatus,
        notes,
        handoverTo: newStatus === "Retrieved" ? handoverTo : "",
        rejectionReason: newStatus === "Rejected" ? rejectionReason : "",
      });

      if (res.success) {
        setActionModal(null);
        setNotes("");
        if (onRequestUpdated) onRequestUpdated(res.request);
      }
    } catch (err) {
      alert("Error transitioning status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
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
                background: "rgba(168, 85, 247, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c084fc",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              <ClipboardList size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.08rem", fontWeight: 800, letterSpacing: "-0.3px" }}>
                {request.requestId}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", gap: "6px" }}>
                <span>Sample: {request.sampleId}</span>
                <span>•</span>
                <span>Requester: {request.requesterName}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: "20px 22px", flex: 1, overflowY: "auto" }}>
          {/* Status Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              background: isRejected
                ? "rgba(244, 63, 94, 0.12)"
                : request.status === "Returned"
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(0, 153, 200, 0.08)",
              border: `1px solid ${
                isRejected
                  ? "rgba(244, 63, 94, 0.3)"
                  : request.status === "Returned"
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(0, 242, 254, 0.25)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Lifecycle State
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: isRejected ? "#f87171" : request.status === "Returned" ? "#34d399" : "#00f2fe",
                }}
              >
                {request.status}
              </div>
            </div>
            <span
              className={`badge ${
                request.priority === "Urgent"
                  ? "badge-critical"
                  : request.priority === "High"
                  ? "badge-high"
                  : "badge-low"
              }`}
            >
              Priority: {request.priority}
            </span>
          </div>

          {/* Interactive Stepper Progress Workflow */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px",
              }}
            >
              Requisition Lifecycle Stepper
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stages.map((stage, idx) => {
                const isPassed = !isRejected && currentStageIndex >= idx;
                const isCurrent = !isRejected && currentStageIndex === idx;

                return (
                  <div
                    key={stage}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: isCurrent
                        ? "rgba(0, 153, 200, 0.08)"
                        : isPassed
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(240, 244, 248, 0.6)",
                      border: `1px solid ${
                        isCurrent
                          ? "rgba(0, 242, 254, 0.3)"
                          : isPassed
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(255, 255, 255, 0.04)"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isPassed ? "#10b981" : isCurrent ? "#00f2fe" : "rgba(0, 153, 200, 0.15)",
                        color: isPassed || isCurrent ? "#040814" : "var(--text-muted)",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? "#00f2fe" : isPassed ? "#f8fafc" : "var(--text-muted)",
                        }}
                      >
                        {stage}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requested Specimen Location Guide */}
          <div
            className="glass-card"
            style={{ padding: "14px 16px", marginBottom: "20px", background: "rgba(255, 255, 255, 0.8)" }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <MapPin size={14} color="#00f2fe" />
              Target Specimen Physical Location
            </div>

            <div
              style={{
                padding: "10px 14px",
                background: "rgba(248, 250, 252, 0.9)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0099c8" }}>
                  {request.sampleId}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  {request.sampleType} • {request.quantityRequested} {request.unit}
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  color: "#10b981",
                  fontFamily: "var(--font-mono)",
                  background: "rgba(16, 185, 129, 0.15)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                {request.storageLocation || "F01 / R01 / B01 / A1"}
              </div>
            </div>
          </div>

          {/* Request Metadata Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div className="glass-card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <User size={13} />
                Requester
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginTop: "4px" }}>
                {request.requesterName}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {request.department}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={13} />
                Expected Return
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginTop: "4px", color: "#f59e0b" }}>
                {request.expectedReturnDate || "Not Specified"}
              </div>
            </div>
          </div>

          {/* Study Purpose */}
          <div className="glass-card" style={{ padding: "12px 14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>
              STUDY PURPOSE & RESEARCH JUSTIFICATION
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {request.studyPurpose}
            </div>
          </div>

          {/* Requisition Audit History */}
          <div style={{ marginTop: "14px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Clock size={13} color="#10b981" />
              Requisition Milestone Audit
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(request.history || []).map((h, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {h.stage}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                    {h.notes || "Milestone reached."}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#0369a1", marginTop: "3px" }}>
                    Operator: <strong>{h.user}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Modal / Drawer Prompt */}
        {actionModal && (
          <div
            style={{
              padding: "16px 22px",
              background: "rgba(255, 255, 255, 0.98)",
              borderTop: "1px solid var(--border-medium)",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "0.86rem", fontWeight: 700, marginBottom: "8px", color: "#0099c8" }}>
              Confirm Stage Transition: {actionModal.toUpperCase()}
            </div>

            {actionModal === "handover" && (
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Handover To (Recipient / Courier)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={handoverTo}
                  onChange={(e) => setHandoverTo(e.target.value)}
                  placeholder="e.g. Dr. Alan Turing / Courier Core"
                />
              </div>
            )}

            {actionModal === "reject" ? (
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Reason for Rejection *
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Inadequate ethics clearance or depleted volume"
                />
              </div>
            ) : (
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Operator Verification Notes
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified cold-chain container..."
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
              <button className="btn btn-ghost" onClick={() => setActionModal(null)}>
                Cancel
              </button>
              <button
                className={`btn ${actionModal === "reject" ? "btn-danger" : "btn-primary"}`}
                disabled={actionLoading}
                onClick={() => {
                  if (actionModal === "approve") handleExecuteTransition("Approved");
                  if (actionModal === "retrieve") handleExecuteTransition("Retrieval In Progress");
                  if (actionModal === "handover") handleExecuteTransition("Retrieved");
                  if (actionModal === "return") handleExecuteTransition("Returned");
                  if (actionModal === "reject") handleExecuteTransition("Rejected");
                }}
              >
                {actionLoading ? "Processing..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        )}

        {/* Drawer Bottom Step Action Buttons */}
        {!actionModal && !isRejected && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {request.status === "Requested" && (
              <>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: "0.8rem" }}
                  onClick={() => setActionModal("reject")}
                >
                  <XCircle size={15} />
                  <span>Reject</span>
                </button>
                <button
                  className="btn btn-emerald"
                  style={{ fontSize: "0.82rem" }}
                  onClick={() => setActionModal("approve")}
                >
                  <ShieldCheck size={15} />
                  <span>Approve Request</span>
                </button>
              </>
            )}

            {request.status === "Approved" && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", fontSize: "0.85rem" }}
                onClick={() => setActionModal("retrieve")}
              >
                <Play size={15} />
                <span>Begin Sample Retrieval from Storage</span>
              </button>
            )}

            {request.status === "Retrieval In Progress" && (
              <button
                className="btn btn-emerald"
                style={{ width: "100%", fontSize: "0.85rem" }}
                onClick={() => setActionModal("handover")}
              >
                <Send size={15} />
                <span>Complete Handover to Requester</span>
              </button>
            )}

            {request.status === "Retrieved" && (
              <button
                className="btn btn-secondary"
                style={{ width: "100%", fontSize: "0.85rem" }}
                onClick={() => setActionModal("return")}
              >
                <RotateCcw size={15} />
                <span>Mark Sample Returned to Storage</span>
              </button>
            )}

            {request.status === "Returned" && (
              <div style={{ textAlign: "center", width: "100%", color: "#34d399", fontSize: "0.82rem", fontWeight: 700 }}>
                ✓ Specimen Requisition Completed & Returned to BioVault
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
