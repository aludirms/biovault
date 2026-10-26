import React, { useState, useEffect } from "react";
import { X, ClipboardList, Search, AlertCircle, Calendar, User, Building } from "lucide-react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export const NewRequestModal = ({ preselectedSample, onClose, onRequestCreated }) => {
  const { user } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sampleId: preselectedSample?.sampleId || "",
    sampleType: preselectedSample?.type || "",
    requesterName: user?.name || "Researcher PQR",
    requesterEmail: user?.email || "researcher@biovault.org",
    department: user?.department || "Oncology Precision Therapeutics",
    studyPurpose: "Transcriptomic Profiling & NGS Target Validation",
    quantityRequested: "1",
    unit: preselectedSample?.unit || "vials",
    priority: preselectedSample?.priorityLevel === "Urgent" ? "Urgent" : "Normal",
    expectedReturnDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const res = await api.get("/samples?status=Stored");
      if (res.success) {
        setSamples(res.samples || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleChange = (sId) => {
    const found = samples.find((s) => s.sampleId === sId);
    setFormData((prev) => ({
      ...prev,
      sampleId: sId,
      sampleType: found ? found.type : prev.sampleType,
      unit: found ? found.unit : prev.unit,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sampleId) {
      setError("Please select a sample to requisition.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("/requests", formData);
      if (res.success) {
        if (onRequestCreated) onRequestCreated(res.request);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ width: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(248, 250, 252, 0.9)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                Submit Specimen Requisition
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
                Initiate sample request and automated chain-of-custody transfer workflow
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "#f87171",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Sample Picker */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Select Specimen / Sample ID *
            </label>
            {preselectedSample ? (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(0, 153, 200, 0.08)",
                  border: "1px solid rgba(0, 242, 254, 0.3)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: "#0099c8", fontFamily: "var(--font-mono)" }}>
                    {preselectedSample.sampleId}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "8px" }}>
                    ({preselectedSample.type} • {preselectedSample.storageLocation?.freezerId})
                  </span>
                </div>
                <span className="badge badge-cyan">{preselectedSample.currentCondition}</span>
              </div>
            ) : (
              <select
                className="glass-select"
                style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                value={formData.sampleId}
                onChange={(e) => handleSampleChange(e.target.value)}
                required
              >
                <option value="">-- Choose Sample from Inventory --</option>
                {samples.map((s) => (
                  <option key={s.id} value={s.sampleId}>
                    {s.sampleId} — {s.type} ({s.quantity} {s.unit} in {s.storageLocation?.freezerId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Requester & Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Requester Name *
              </label>
              <input
                type="text"
                required
                className="glass-input"
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Department / Research Core *
              </label>
              <input
                type="text"
                required
                className="glass-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          {/* Purpose & Study */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Study Purpose & Justification *
            </label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.studyPurpose}
              onChange={(e) => setFormData({ ...formData, studyPurpose: e.target.value })}
              placeholder="e.g. Mass-spec metabolomic assay for Phase II study..."
            />
          </div>

          {/* Quantity, Priority, Expected Return */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Quantity Needed
              </label>
              <input
                type="number"
                step="any"
                required
                className="glass-input"
                value={formData.quantityRequested}
                onChange={(e) => setFormData({ ...formData, quantityRequested: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Priority Level
              </label>
              <select
                className="glass-select"
                style={{ width: "100%" }}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Expected Return Date
              </label>
              <input
                type="date"
                required
                className="glass-input"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Handling Instructions / Special Requirements
            </label>
            <textarea
              className="glass-input"
              style={{ height: "60px", resize: "none" }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Keep on dry ice during courier transit..."
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "14px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting Requisition..." : "Submit Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
