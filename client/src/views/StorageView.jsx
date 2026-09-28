import React, { useState, useEffect } from "react";
import {
  Server,
  Layers,
  Box,
  Grid,
  ThermometerSnowflake,
  AlertTriangle,
  ArrowRight,
  Dna,
  Plus,
  Eye,
  CheckCircle2,
  MapPin,
  Maximize2,
} from "lucide-react";
import { api } from "../api/apiClient";

export const StorageView = ({ onInspectSample, onOpenAddSample }) => {
  const [freezers, setFreezers] = useState([]);
  const [selectedFreezerId, setSelectedFreezerId] = useState("F01");
  const [selectedRackId, setSelectedRackId] = useState("R01");
  const [selectedBoxId, setSelectedBoxId] = useState("B01");
  const [gridData, setGridData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);

  useEffect(() => {
    fetchFreezers();
  }, []);

  useEffect(() => {
    if (selectedFreezerId && selectedRackId && selectedBoxId) {
      fetchBoxGrid(selectedFreezerId, selectedRackId, selectedBoxId);
    }
  }, [selectedFreezerId, selectedRackId, selectedBoxId]);

  const fetchFreezers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/storage/freezers");
      if (res.success) {
        setFreezers(res.freezers || []);
        if (res.freezers?.length > 0 && !selectedFreezerId) {
          setSelectedFreezerId(res.freezers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxGrid = async (fId, rId, bId) => {
    setGridLoading(true);
    try {
      const res = await api.get(`/storage/grid/${fId}/${rId}/${bId}`);
      if (res.success) {
        setGridData(res);
        setSelectedCell(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGridLoading(false);
    }
  };

  const currentFreezer = freezers.find((f) => f.id === selectedFreezerId);
  const racks = Array.from({ length: currentFreezer?.racksCount || 6 }, (_, i) => `R0${i + 1}`);
  const boxes = Array.from({ length: currentFreezer?.boxesPerRack || 10 }, (_, i) => `B0${i + 1}`);

  const getSampleColor = (type) => {
    switch (type) {
      case "DNA Extract":
        return "#3b82f6";
      case "RNA Extract":
        return "#a855f7";
      case "Biopsy Tissue":
        return "#10b981";
      case "Whole Blood":
        return "#ef4444";
      case "Blood Plasma":
        return "#f59e0b";
      case "Cell Line":
        return "#06b6d4";
      case "PBMC":
        return "#ec4899";
      case "Synovial Fluid":
        return "#0ea5e9";
      case "Urine":
        return "#eab308";
      default:
        return "#00f2fe";
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
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
              Physical Storage Hierarchy & Matrix
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
              Trace: Freezer ➔ Rack ➔ Box ➔ Position
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Interactive specimen locator, 81-well cryobox matrix, and real-time cryogenic telemetry.
          </p>
        </div>
      </div>

      {/* Level 1: Freezer Selector Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
        }}
      >
        {freezers.map((freezer) => {
          const isSelected = freezer.id === selectedFreezerId;
          const isWarning = freezer.status !== "Normal";
          const occupancyRate = ((freezer.occupied / freezer.capacity) * 100).toFixed(0);

          return (
            <div
              key={freezer.id}
              className="glass-card"
              onClick={() => setSelectedFreezerId(freezer.id)}
              style={{
                padding: "16px",
                cursor: "pointer",
                background: isSelected
                  ? "linear-gradient(145deg, rgba(0, 153, 200, 0.1) 0%, rgba(17, 23, 38, 0.95) 100%)"
                  : "rgba(255, 255, 255, 0.8)",
                border: isSelected
                  ? "2px solid #00f2fe"
                  : isWarning
                  ? "1px solid rgba(245, 158, 11, 0.4)"
                  : "1px solid var(--border-subtle)",
                boxShadow: isSelected ? "0 0 20px rgba(0, 242, 254, 0.25)" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: isSelected ? "#00f2fe" : "rgba(0, 0, 0, 0.05)",
                      color: isSelected ? "#040814" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {freezer.id}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {freezer.name}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {freezer.location}
                    </div>
                  </div>
                </div>

                <span className={`badge ${isWarning ? "badge-high" : "badge-low"}`} style={{ fontSize: "0.62rem" }}>
                  {freezer.status}
                </span>
              </div>

              {/* Temp and Occupancy */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <ThermometerSnowflake size={13} color="#00f2fe" />
                  {freezer.currentTemp}°C
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {occupancyRate}% Full ({freezer.occupied}/{freezer.capacity})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Hierarchy Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "22px" }}>
        {/* Left Sub-Nav: Racks & Boxes Selector */}
        <div className="glass-panel" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Racks Selector */}
          <div>
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
                gap: "6px",
              }}
            >
              <Layers size={14} color="#00f2fe" />
              Racks in {currentFreezer?.name || selectedFreezerId}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {racks.map((r) => {
                const isSelected = r === selectedRackId;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRackId(r)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #00f2fe" : "1px solid var(--border-subtle)",
                      background: isSelected ? "rgba(0, 153, 200, 0.12)" : "rgba(255, 255, 255, 0.8)",
                      color: isSelected ? "#00f2fe" : "var(--text-secondary)",
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boxes Selector in selected Rack */}
          <div>
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
                gap: "6px",
              }}
            >
              <Box size={14} color="#10b981" />
              Boxes in Rack {selectedRackId}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {boxes.map((b) => {
                const isSelected = b === selectedBoxId;
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBoxId(b)}
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #10b981" : "1px solid var(--border-subtle)",
                      background: isSelected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.8)",
                      color: isSelected ? "#34d399" : "var(--text-secondary)",
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span>{b}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>81 wells</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Breadcrumb Tracker */}
          <div
            style={{
              marginTop: "auto",
              padding: "12px",
              background: "rgba(248, 250, 252, 0.9)",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.74rem",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>ACTIVE TRACE PATH:</div>
            <div style={{ fontWeight: 800, color: "#0099c8", fontFamily: "var(--font-mono)" }}>
              {selectedFreezerId} ➔ {selectedRackId} ➔ {selectedBoxId}
            </div>
          </div>
        </div>

        {/* Right Area: Interactive 9x9 Position Matrix & Selected Cell Details */}
        <div className="glass-panel" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Matrix Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Grid size={18} color="#00f2fe" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                  CryoBox {selectedBoxId} — 9×9 Position Grid (81 Wells)
                </h3>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Occupancy: <strong style={{ color: "#0099c8" }}>{gridData?.occupiedPositions || 0}</strong> occupied • <strong style={{ color: "#10b981" }}>{gridData?.availablePositions || 81}</strong> vacant
              </div>
            </div>

            {/* Matrix Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "0.72rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(0, 242, 254, 0.4)", border: "1px solid #00f2fe" }} />
                <span>Occupied</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <span>Vacant</span>
              </div>
            </div>
          </div>

          {/* 9x9 Matrix Grid */}
          {gridLoading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Loading grid matrix...
            </div>
          ) : gridData?.grid ? (
            <div>
              {/* Column Numbers Header 1-9 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px repeat(9, 1fr)",
                  gap: "6px",
                  marginBottom: "4px",
                  textAlign: "center",
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}
              >
                <div />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                  <div key={c}>{c}</div>
                ))}
              </div>

              {/* Rows A-I */}
              {gridData.grid.map((rowCells, rIdx) => {
                const rowLetter = ["A", "B", "C", "D", "E", "F", "G", "H", "I"][rIdx];
                return (
                  <div
                    key={rowLetter}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px repeat(9, 1fr)",
                      gap: "6px",
                      marginBottom: "6px",
                      alignItems: "center",
                    }}
                  >
                    {/* Row Label A-I */}
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "0.72rem",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                      }}
                    >
                      {rowLetter}
                    </div>

                    {/* 9 Cells */}
                    {rowCells.map((cell) => {
                      const isOccupied = cell.isOccupied;
                      const isSelected = selectedCell?.position === cell.position;
                      const sampleColor = isOccupied ? getSampleColor(cell.sample?.type) : "transparent";

                      return (
                        <div
                          key={cell.position}
                          className={`grid-cell ${isOccupied ? "occupied" : "vacant"}`}
                          onClick={() => setSelectedCell(cell)}
                          style={{
                            border: isSelected
                              ? "2px solid #ffffff"
                              : isOccupied
                              ? `1px solid ${sampleColor}`
                              : "1px solid rgba(255, 255, 255, 0.05)",
                            background: isOccupied
                              ? `${sampleColor}22`
                              : isSelected
                              ? "rgba(0, 153, 200, 0.12)"
                              : "rgba(255, 255, 255, 0.02)",
                            boxShadow: isSelected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                          }}
                          title={
                            isOccupied
                              ? `${cell.position}: ${cell.sample?.sampleId} (${cell.sample?.type})`
                              : `${cell.position}: Vacant`
                          }
                        >
                          <span style={{ fontWeight: 700, fontSize: "0.68rem" }}>{cell.position}</span>
                          {isOccupied && (
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: sampleColor,
                                marginTop: "2px",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Selected Cell Inspection Panel */}
          {selectedCell ? (
            <div
              className="glass-card animate-fade-in"
              style={{
                padding: "16px 20px",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid var(--border-medium)",
                marginTop: "10px",
              }}
            >
              {selectedCell.isOccupied && selectedCell.sample ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="badge badge-cyan" style={{ fontFamily: "var(--font-mono)" }}>
                        POSITION {selectedCell.position}
                      </span>
                      <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {selectedCell.sample.sampleId}
                      </span>
                      <span className="badge badge-purple">{selectedCell.sample.type}</span>
                      <span className="badge badge-low">{selectedCell.sample.currentCondition}</span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      Study: <strong>{selectedCell.sample.study}</strong> • Donor: {selectedCell.sample.donorId} • Vol: {selectedCell.sample.quantity} {selectedCell.sample.unit}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => onInspectSample(selectedCell.sample.sampleId)}
                  >
                    <Eye size={15} />
                    <span>Inspect Full Specimen Record</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span className="badge badge-low" style={{ fontFamily: "var(--font-mono)" }}>
                      POSITION {selectedCell.position}
                    </span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 700, marginLeft: "8px", color: "#34d399" }}>
                      Vacant Cryo Well
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Slot is available for new specimen assignment in {selectedFreezerId} / {selectedRackId} / {selectedBoxId}.
                    </div>
                  </div>

                  <button className="btn btn-emerald" onClick={onOpenAddSample}>
                    <Plus size={15} />
                    <span>Register Specimen Here</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(240, 244, 248, 0.6)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-subtle)",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
              }}
            >
              Select any cell in the 9×9 matrix above to inspect specimen data or assign a vacant well.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
