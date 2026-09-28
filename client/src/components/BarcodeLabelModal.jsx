import React, { useRef } from "react";
import { X, Printer, QrCode, Shield, CheckCircle2 } from "lucide-react";

export const BarcodeLabelModal = ({ sample, onClose }) => {
  const printRef = useRef(null);

  if (!sample) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ width: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <QrCode size={18} color="#00f2fe" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
              Cryo Barcode & Tag Generator
            </h3>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Cryo Tag Preview */}
        <div style={{ padding: "24px 20px" }}>
          <div
            ref={printRef}
            style={{
              background: "#ffffff",
              color: "#0f172a",
              padding: "18px",
              borderRadius: "8px",
              border: "2px solid #000000",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {/* Header / BioVault watermark */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "8px",
                marginBottom: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.5px" }}>
                  BIOVAULT BIOBANK
                </span>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569" }}>
                  CRYO-PRESERVED SPECIMEN TAG
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                {sample.storageLocation?.freezerId || "F01"}
              </div>
            </div>

            {/* Middle: Simulated Barcode + QR + Details */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              {/* Simulated 2D Matrix QR Code */}
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  border: "2px solid #0f172a",
                  padding: "4px",
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "2px",
                  background: "#0f172a",
                }}
              >
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background:
                        (i * 7 + (sample.sampleId?.length || 5)) % 3 === 0
                          ? "#ffffff"
                          : "#0f172a",
                      borderRadius: "1px",
                    }}
                  />
                ))}
              </div>

              {/* Sample Core Metadata */}
              <div style={{ flex: 1, fontSize: "0.78rem" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#000000" }}>
                  {sample.sampleId}
                </div>
                <div style={{ color: "#334155", fontWeight: 700 }}>
                  TYPE: <span style={{ color: "#0f172a" }}>{sample.type}</span>
                </div>
                <div style={{ color: "#334155" }}>
                  LOC: <span style={{ fontWeight: 800 }}>{sample.storageLocation?.freezerId} / {sample.storageLocation?.rack} / {sample.storageLocation?.box} / {sample.storageLocation?.position}</span>
                </div>
                <div style={{ color: "#334155" }}>
                  DONOR: {sample.donorId} • VOL: {sample.quantity} {sample.unit}
                </div>
              </div>
            </div>

            {/* Simulated 1D Barcode Strips */}
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px dashed #cbd5e1" }}>
              <div
                style={{
                  height: "36px",
                  display: "flex",
                  alignItems: "stretch",
                  justifyContent: "center",
                  gap: "2px",
                  background: "#ffffff",
                }}
              >
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i % 4 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1px",
                      background: "#0f172a",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.7rem",
                  letterSpacing: "3px",
                  fontWeight: 800,
                  marginTop: "3px",
                }}
              >
                *{sample.barcode || sample.sampleId}*
              </div>
            </div>

            {/* Footer warning */}
            <div
              style={{
                marginTop: "10px",
                fontSize: "0.62rem",
                color: "#64748b",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              CRYOGENIC COMPLIANT • STORE AT {sample.storageLocation?.freezerId === "F02" ? "-196°C" : "-80°C"} • BIOHAZARD LEVEL 2
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              background: "rgba(16, 185, 129, 0.08)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              fontSize: "0.78rem",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>Ready for thermal transfer label printing (Zebra / Brady CryoTags).</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            background: "rgba(240, 244, 248, 0.6)",
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Cryo Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
