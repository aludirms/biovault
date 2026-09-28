import React, { useState } from "react";
import { X, Dna, Sparkles, MapPin, AlertCircle, Layers, Check } from "lucide-react";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export const AddSampleModal = ({ onClose, onSampleCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sampleTypes = [
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
    "Saliva",
  ];

  const units = ["mL", "uL", "vials", "mg", "slides"];
  const freezers = [
    { id: "F01", name: "F01 - Ultra-Low Deep Freezer Alpha (-80°C)" },
    { id: "F02", name: "F02 - Cryo LN2 Tank CryoVault Beta (-196°C)" },
    { id: "F03", name: "F03 - BioPreserve Standard Freezer Gamma (-20°C)" },
    { id: "F04", name: "F04 - Cold Storage Room Delta (+4°C)" },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultExpiryStr = new Date(Date.now() + 365 * 24 * 3600 * 1000)
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    sampleId: `BV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    donorId: `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
    type: "DNA Extract",
    study: "OncoGenome Atlas 2026",
    collectionDate: todayStr,
    expiryDate: defaultExpiryStr,
    quantity: "25",
    unit: "uL",
    initialCondition: "Optimal",
    freezerId: "F01",
    rack: "R01",
    box: "B01",
    position: `A${Math.floor(1 + Math.random() * 9)}`,
    riskLevel: "Low",
    priorityLevel: "Standard",
    attentionReason: "",
    notes: "",
  });

  const handleGenerateId = () => {
    setFormData((prev) => ({
      ...prev,
      sampleId: `BV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      donorId: `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedFreezer = freezers.find((f) => f.id === formData.freezerId);
      const payload = {
        sampleId: formData.sampleId,
        donorId: formData.donorId,
        type: formData.type,
        study: formData.study,
        collectionDate: formData.collectionDate,
        expiryDate: formData.expiryDate,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        initialCondition: formData.initialCondition,
        storageLocation: {
          freezerId: formData.freezerId,
          freezerName: selectedFreezer ? selectedFreezer.name : "Freezer",
          rack: formData.rack,
          box: formData.box,
          position: formData.position,
        },
        riskLevel: formData.riskLevel,
        priorityLevel: formData.priorityLevel,
        attentionReason: formData.attentionReason,
        notes: formData.notes,
        registeredBy: user?.name || "Biobank Technician",
      };

      const res = await api.post("/samples", payload);
      if (res.success) {
        if (onSampleCreated) onSampleCreated(res.sample);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to register sample.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ width: "680px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
                background: "linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#040814",
              }}
            >
              <Dna size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                Register New Biological Specimen
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
                Log inventory metadata, cryo storage slot, and quality parameters
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px" }}>
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

          {/* Section 1: Identification */}
          <div style={{ marginBottom: "18px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}
            >
              1. Specimen Identification
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                    Sample ID *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0099c8",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <Sparkles size={12} /> Auto Gen
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="glass-input"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  value={formData.sampleId}
                  onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Donor / Subject ID *
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.donorId}
                  onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Biological Sample Type *
                </label>
                <select
                  className="glass-select"
                  style={{ width: "100%" }}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {sampleTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Research Study / Cohort *
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.study}
                  onChange={(e) => setFormData({ ...formData, study: e.target.value })}
                  placeholder="e.g. OncoGenome Atlas 2026"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Volume, Condition & Dates */}
          <div style={{ marginBottom: "18px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}
            >
              2. Quantity & Condition
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  className="glass-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Unit
                </label>
                <select
                  className="glass-select"
                  style={{ width: "100%" }}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Collection Date
                </label>
                <input
                  type="date"
                  required
                  className="glass-input"
                  value={formData.collectionDate}
                  onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Review / Expiry
                </label>
                <input
                  type="date"
                  required
                  className="glass-input"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Storage Slot Assignment */}
          <div style={{ marginBottom: "18px" }}>
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
              <MapPin size={13} color="#00f2fe" />
              3. Physical Storage Slot Assignment
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
                  Freezer Unit
                </label>
                <select
                  className="glass-select"
                  style={{ width: "100%" }}
                  value={formData.freezerId}
                  onChange={(e) => setFormData({ ...formData, freezerId: e.target.value })}
                >
                  {freezers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
                  Rack
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.rack}
                  onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                  placeholder="R01"
                />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
                  Box
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.box}
                  onChange={(e) => setFormData({ ...formData, box: e.target.value })}
                  placeholder="B01"
                />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
                  Position
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="A1"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Risk, Urgency & Attention Notes */}
          <div style={{ marginBottom: "18px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}
            >
              4. Risk & Urgency Classification
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Risk Classification
                </label>
                <select
                  className="glass-select"
                  style={{ width: "100%" }}
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Critical">Critical Risk</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Priority / Urgency
                </label>
                <select
                  className="glass-select"
                  style={{ width: "100%" }}
                  value={formData.priorityLevel}
                  onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                >
                  <option value="Standard">Standard Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Action Required</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Attention Reason / Storage Notes (Optional)
              </label>
              <textarea
                className="glass-input"
                style={{ height: "65px", resize: "none" }}
                value={formData.attentionReason}
                onChange={(e) => setFormData({ ...formData, attentionReason: e.target.value })}
                placeholder="Detail any handling precautions, temperature drift vulnerability, or trial milestones..."
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "14px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Specimen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
