import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "cyan", // cyan, emerald, amber, crimson, purple
  badge,
  onClick,
}) => {
  const accentConfigs = {
    cyan: {
      color: "#0099c8",
      glow: "rgba(0, 153, 200, 0.12)",
      border: "rgba(0, 242, 254, 0.3)",
      iconBg: "rgba(0, 153, 200, 0.1)",
    },
    emerald: {
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.3)",
      iconBg: "rgba(16, 185, 129, 0.12)",
    },
    amber: {
      color: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.3)",
      iconBg: "rgba(245, 158, 11, 0.12)",
    },
    crimson: {
      color: "#f43f5e",
      glow: "rgba(244, 63, 94, 0.18)",
      border: "rgba(244, 63, 94, 0.35)",
      iconBg: "rgba(244, 63, 94, 0.12)",
    },
    purple: {
      color: "#a855f7",
      glow: "rgba(168, 85, 247, 0.15)",
      border: "rgba(168, 85, 247, 0.3)",
      iconBg: "rgba(168, 85, 247, 0.12)",
    },
  };

  const config = accentConfigs[accent] || accentConfigs.cyan;

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        background: `linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 244, 248, 0.9) 100%)`,
      }}
    >
      {/* Subtle top border glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "2px",
          background: `radial-gradient(ellipse at center, ${config.color} 0%, transparent 80%)`,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: config.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.color,
              border: `1px solid ${config.border}`,
            }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
        <span
          style={{
            fontSize: "1.9rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {value}
        </span>
        {badge && (
          <span
            className={`badge badge-${accent}`}
            style={{ fontSize: "0.68rem", padding: "2px 7px" }}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
