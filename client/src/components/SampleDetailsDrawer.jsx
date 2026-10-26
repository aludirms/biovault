import React, { useState, useEffect } from "react";
import {
  X,
  Dna,
  Server,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Layers,
  FileText,
  Printer,
  ClipboardList,
  Edit3,
  CheckCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "../api/apiClient";

export const SampleDetailsDrawer = ({
  sample,
  onClose,
  onRequestSample,
  onPrintLabel,
  onSampleUpdated,
}) => {
  const [custodyData, setCustodyData] = useState(null);
  const [loadingCustody, setLoadingCustody] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRisk, setEditRisk] = useState(sample?.riskLevel || "Low");
  const [editPriority, setEditPriority] = useState(sample?.priorityLevel || "Standard");
  const [editAttentionReason, setEditAttentionReason] = useState(sample?.attentionReason || "");
  const [editCondition, setEditCondition] = useState(sample?.currentCondition || "Optimal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sample?.sampleId) {
      setEditRisk(sample.riskLevel || "Low");
      setEditPriority(sample.priorityLevel || "Standard");
      setEditAttentionReason(sample.attentionReason || "");
      setEditCondition(sample.currentCondition || "Optimal");
      fetchCustody();
    }
  }, [sample]);

  const fetchCustody = async () => {
    setLoadingCustody(true);
    try {
      const res = await api.get(`/activity/custody/${sample.sampleId}`);
      if (res.success) {
        setCustodyData(res);
      }
    } catch (err) {
      console.error("Custody fetch error:", err);
    } finally {
      setLoadingCustody(false);
    }
  };

  if (!sample) return null;

  const handleSaveUpdates = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/samples/${sample.sampleId}`, {
        riskLevel: editRisk,
        priorityLevel: editPriority,
        attentionReason: editAttentionReason,
        currentCondition: editCondition,
      });
      if (res.success) {
        setIsEditing(false);
        if (onSampleUpdated) onSampleUpdated(res.sample);
        fetchCustody();
      }
    } catch (err) {
      alert("Error updating sample: " + err.message);
    } finally {
      setSaving(false);
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
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Top Header */}
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
                background: "rgba(0, 153, 200, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0099c8",
                border: "1px solid rgba(0, 242, 254, 0.3)",
              }}
            >
              <Dna size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.08rem", fontWeight: 800, letterSpacing: "-0.3px" }}>
                {sample.sampleId}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", gap: "6px" }}>
                <span>{sample.type}</span>
                <span>•</span>
                <span>Donor: {sample.donorId}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
              style={{ padding: "6px 10px", fontSize: "0.76rem" }}
            >
              <Edit3 size={14} />
              <span>{isEditing ? "Cancel" : "Edit"}</span>
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: "20px 22px", flex: 1, overflowY: "auto" }}>
          {/* Quick Status / Risk Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <span className={`badge ${getRiskBadgeClass(sample.riskLevel)}`}>
              Risk: {sample.riskLevel}
            </span>
            <span className={`badge ${getPriorityBadgeClass(sample.priorityLevel)}`}>
              Priority: {sample.priorityLevel}
            </span>
            <span className="badge badge-cyan">Status: {sample.status}</span>
            <span className="badge badge-purple">{sample.currentCondition}</span>
          </div>

          {/* Attention / Risk Reason Alert Box if present */}
          {(sample.riskLevel === "High" ||
            sample.riskLevel === "Critical" ||
            sample.priorityLevel === "Urgent" ||
            sample.attentionReason) && (
            <div
              style={{
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
              }}
            >
              <ShieldAlert size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f87171" }}>
                  Flagged for Attention
                </div>
                <div style={{ fontSize: "0.76rem", color: "#be123c", marginTop: "2px", lineHeight: "1.4" }}>
                  {sample.attentionReason ||
                    "This specimen has elevated risk or urgent priority parameters that require biobank protocol compliance."}
                </div>
              </div>
            </div>
          )}

          {/* Storage Hierarchy Breadcrumb Card */}
          <div
            className="glass-card"
            style={{
              padding: "14px 16px",
              marginBottom: "20px",
              background: "rgba(255, 255, 255, 0.8)",
            }}
          >
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
                gap: "6px",
              }}
            >
              <MapPin size={14} color="#00f2fe" />
              Physical Storage Locator
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                background: "rgba(248, 250, 252, 0.9)",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>FREEZER</div>
                <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0099c8" }}>
                  {sample.storageLocation?.freezerId || "F01"}
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>RACK</div>
                <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {sample.storageLocation?.rack || "R01"}
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>BOX</div>
                <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {sample.storageLocation?.box || "B01"}
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>POSITION</div>
                <div
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 800,
                    color: "#10b981",
                    background: "rgba(16, 185, 129, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {sample.storageLocation?.position || "A1"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Unit: {sample.storageLocation?.freezerName || "Ultra-Low Cryo Freezer"}
            </div>
          </div>

          {/* Edit Form Mode */}
          {isEditing ? (
            <div
              className="glass-panel"
              style={{ padding: "16px", marginBottom: "20px", border: "1px solid var(--border-medium)" }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px", color: "#0099c8" }}>
                Modify Risk & Condition
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Risk Level
                  </label>
                  <select
                    className="glass-select"
                    style={{ width: "100%" }}
                    value={editRisk}
                    onChange={(e) => setEditRisk(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Priority Level
                  </label>
                  <select
                    className="glass-select"
                    style={{ width: "100%" }}
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Current Condition
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  placeholder="e.g. Optimal, Review Needed, Thawed..."
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Attention Reason / Notes
                </label>
                <textarea
                  className="glass-input"
                  style={{ height: "60px", resize: "none" }}
                  value={editAttentionReason}
                  onChange={(e) => setEditAttentionReason(e.target.value)}
                  placeholder="Explain why risk or priority has been updated..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveUpdates} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Sample Detailed Specifications Grid */}
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
                <Layers size={13} />
                Quantity & Aliquots
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, marginTop: "4px", color: "var(--text-primary)" }}>
                {sample.quantity} {sample.unit}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <FileText size={13} />
                Associated Study
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginTop: "4px",
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={sample.study}
              >
                {sample.study}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={13} />
                Collection Date
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "4px" }}>
                {sample.collectionDate}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={13} />
                Review / Expiry Date
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "4px", color: "#f59e0b" }}>
                {sample.expiryDate}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {sample.notes && (
            <div className="glass-card" style={{ padding: "12px 14px", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                SPECIMEN PROTOCOL NOTES
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
                {sample.notes}
              </div>
            </div>
          )}

          {/* Registered By Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(240, 244, 248, 0.6)",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              marginBottom: "20px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <span>Registered By: <strong style={{ color: "var(--text-primary)" }}>{sample.registeredBy || "Technician ABC"}</strong></span>
            <span>Created: {new Date(sample.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Chain of Custody & Lifecycle Timeline */}
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} color="#10b981" />
                <span>Chain of Custody Timeline</span>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {custodyData?.timeline?.length || 0} Events
              </span>
            </div>

            {loadingCustody ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Loading custody history...
              </div>
            ) : custodyData?.timeline && custodyData.timeline.length > 0 ? (
              <div style={{ position: "relative", paddingLeft: "20px" }}>
                {/* Vertical timeline connector */}
                <div
                  style={{
                    position: "absolute",
                    left: "7px",
                    top: "10px",
                    bottom: "10px",
                    width: "2px",
                    background: "rgba(0, 153, 200, 0.15)",
                  }}
                />

                {custodyData.timeline.map((event, idx) => (
                  <div key={idx} style={{ position: "relative", marginBottom: "16px" }}>
                    {/* Circle marker */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-20px",
                        top: "3px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: idx === custodyData.timeline.length - 1 ? "#00f2fe" : "#e2e8f0",
                        border: "2px solid #00f2fe",
                        boxShadow: idx === custodyData.timeline.length - 1 ? "0 0 8px #00f2fe" : "none",
                      }}
                    />
                    <div
                      className="glass-card"
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {event.stage}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {event.details}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--bio-emerald)", marginTop: "4px" }}>
                        Handler: <strong>{event.operator}</strong> {event.location ? `• ${event.location}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "10px" }}>
                No custody log events recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Sticky Action Bar */}
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
          <button
            className="btn btn-secondary"
            onClick={() => onPrintLabel(sample)}
            style={{ fontSize: "0.8rem" }}
          >
            <Printer size={15} />
            <span>Cryo Barcode</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onRequestSample(sample)}
            style={{ fontSize: "0.82rem" }}
          >
            <ClipboardList size={15} />
            <span>Create Sample Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
