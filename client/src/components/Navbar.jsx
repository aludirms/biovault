import React, { useState } from "react";
import {
  LayoutDashboard,
  Dna,
  Server,
  ClipboardList,
  AlertTriangle,
  History,
  Plus,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  CalendarClock,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../context/AuthContext";

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAddSample,
  onOpenNewRequest,
  activeAlertsCount = 0,
  onQuickSearch,
}) => {
  const { user, switchAccount, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onQuickSearch) onQuickSearch(searchQuery.trim());
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "samples", label: "Samples", icon: Dna },
    { id: "storage", label: "Storage", icon: Server },
    { id: "requests", label: "Requests", icon: ClipboardList },
    {
      id: "alerts",
      label: "Alerts & Risk",
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
    },
    { id: "activity", label: "Activity", icon: History },
    { id: "expiry", label: "Expiry Watch", icon: CalendarClock },
    ...(user?.role === "admin"
      ? [{ id: "admin", label: "Admin Console", icon: ShieldCheck }]
      : []),
  ];

  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 900,
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Brand & Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("dashboard")}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0099c8 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(0, 242, 254, 0.4)",
            }}
          >
            <Dna size={22} color="#040814" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "1.18rem",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  background: "linear-gradient(135deg, #0f172a 40%, #475569 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BIOVAULT
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  padding: "1px 6px",
                  background: "rgba(0, 153, 200, 0.12)",
                  color: "#0369a1",
                  borderRadius: "4px",
                  fontWeight: 700,
                  border: "1px solid rgba(0, 242, 254, 0.25)",
                }}
              >
                v2.4
              </span>
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span className="status-dot status-dot-emerald" style={{ width: 6, height: 6 }} />
              Biobank Cryo Repository
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(0, 0, 0, 0.05)",
            padding: "4px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(0, 153, 200, 0.12) 0%, rgba(59, 130, 246, 0.15) 100%)"
                    : "transparent",
                  color: isActive ? "#0369a1" : "var(--text-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(0, 153, 200, 0.3)" : "none",
                  position: "relative",
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      background: "#f43f5e",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: "10px",
                      boxShadow: "0 0 8px rgba(244, 63, 94, 0.6)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Quick Search, Action, Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
            <Search
              size={15}
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
              placeholder="Search sample, donor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{
                paddingLeft: "32px",
                paddingRight: "10px",
                paddingTop: "6px",
                paddingBottom: "6px",
                fontSize: "0.8rem",
                width: "190px",
                height: "34px",
              }}
            />
          </form>

          {/* Role-Specific Quick Action Button */}
          {user?.role === "technician" && (
            <button
              className="btn btn-primary"
              onClick={onOpenAddSample}
              style={{
                padding: "7px 14px",
                fontSize: "0.82rem",
                height: "34px",
              }}
              title="Technician: Register new incoming specimen"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Register Sample</span>
            </button>
          )}

          {user?.role === "researcher" && (
            <button
              className="btn btn-emerald"
              onClick={onOpenNewRequest}
              style={{
                padding: "7px 14px",
                fontSize: "0.82rem",
                height: "34px",
              }}
              title="Researcher: Submit sample access requisition"
            >
              <ClipboardList size={15} />
              <span>New Requisition</span>
            </button>
          )}

          {user?.role === "admin" && (
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab("admin")}
              style={{
                padding: "7px 14px",
                fontSize: "0.82rem",
                height: "34px",
              }}
              title="Admin: Open Governance Console"
            >
              <ShieldCheck size={15} />
              <span>Admin Console</span>
            </button>
          )}

          {user?.role === "auditor" && (
            <button
              className="btn btn-secondary"
              onClick={() => setActiveTab("activity")}
              style={{
                padding: "7px 14px",
                fontSize: "0.82rem",
                height: "34px",
              }}
              title="Auditor: View regulatory audit trail"
            >
              <History size={15} />
              <span>Audit Trail</span>
            </button>
          )}

          {/* User Profile Pill & Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "4px 12px 4px 5px",
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {user?.avatar || "BV"}
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    maxWidth: "110px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name || "Staff Member"}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#0369a1",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role || "Operator"}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "42px",
                  width: "260px",
                  padding: "12px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 950,
                }}
              >
                <div
                  style={{
                    paddingBottom: "10px",
                    borderBottom: "1px solid var(--border-subtle)",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ fontSize: "0.86rem", fontWeight: 700 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {user?.email}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "0.7rem",
                      color: "var(--bio-emerald)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ShieldCheck size={13} />
                    {user?.roleLabel || "Authorized Staff"}
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Switch Role / Test Profile:
                </div>

                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      switchAccount(acc);
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "none",
                      background: acc.id === user?.id ? "rgba(0, 153, 200, 0.1)" : "transparent",
                      color: acc.id === user?.id ? "#0369a1" : "var(--text-secondary)",
                      fontSize: "0.76rem",
                      cursor: "pointer",
                      marginBottom: "3px",
                    }}
                  >
                    <span>{acc.name}</span>
                    <span style={{ fontSize: "0.66rem", opacity: 0.7 }}>({acc.role})</span>
                  </button>
                ))}

                <div
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    marginTop: "8px",
                    paddingTop: "8px",
                  }}
                >
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      color: "var(--alert-crimson)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
