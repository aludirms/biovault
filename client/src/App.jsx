import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./views/DashboardView";
import { SamplesView } from "./views/SamplesView";
import { StorageView } from "./views/StorageView";
import { RequestsView } from "./views/RequestsView";
import { AlertsView } from "./views/AlertsView";
import { ActivityView } from "./views/ActivityView";
import { AdminView } from "./views/AdminView";
import { ExpiryDashboardView } from "./views/ExpiryDashboardView";
import { LoginView } from "./views/LoginView";
import { AddSampleModal } from "./components/AddSampleModal";
import { NewRequestModal } from "./components/NewRequestModal";
import { SampleDetailsDrawer } from "./components/SampleDetailsDrawer";
import { RequestDetailsDrawer } from "./components/RequestDetailsDrawer";
import { AlertDetailsDrawer } from "./components/AlertDetailsDrawer";
import { BarcodeLabelModal } from "./components/BarcodeLabelModal";
import { useAuth } from "./context/AuthContext";
import { api } from "./api/apiClient";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function App() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Global Drawers & Modals
  const [isAddSampleOpen, setIsAddSampleOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [requestTargetSample, setRequestTargetSample] = useState(null);

  const [inspectingSample, setInspectingSample] = useState(null);
  const [inspectingRequest, setInspectingRequest] = useState(null);
  const [inspectingAlert, setInspectingAlert] = useState(null);
  const [printingSampleLabel, setPrintingSampleLabel] = useState(null);

  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Search bridge
  const [sampleSearchQuery, setSampleSearchQuery] = useState("");
  const [activitySampleId, setActivitySampleId] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalAlertCount();
    }
  }, [isAuthenticated, activeTab]);

  const fetchGlobalAlertCount = async () => {
    try {
      const res = await api.get("/alerts?status=Active");
      if (res.success) {
        setActiveAlertsCount(res.count || 0);
      }
    } catch (err) {}
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleInspectSampleById = async (sampleId) => {
    try {
      const res = await api.get(`/samples/${sampleId}`);
      if (res.success) {
        setInspectingSample(res.sample);
      }
    } catch (err) {
      showToast("Could not find sample: " + sampleId, "error");
    }
  };

  const handleQuickSearch = (query) => {
    setSampleSearchQuery(query);
    setActiveTab("samples");
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => showToast("Welcome back to BioVault.", "success")} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddSample={() => setIsAddSampleOpen(true)}
        activeAlertsCount={activeAlertsCount}
        onQuickSearch={handleQuickSearch}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === "dashboard" && (
          <DashboardView
            onOpenAddSample={() => setIsAddSampleOpen(true)}
            onOpenNewRequest={() => {
              setRequestTargetSample(null);
              setIsNewRequestOpen(true);
            }}
            onNavigate={(tab) => setActiveTab(tab)}
            onInspectSample={handleInspectSampleById}
            onInspectAlert={(alert) => setInspectingAlert(alert)}
          />
        )}

        {activeTab === "samples" && (
          <SamplesView
            initialSearch={sampleSearchQuery}
            onOpenAddSample={() => setIsAddSampleOpen(true)}
            onInspectSample={handleInspectSampleById}
            onOpenNewRequest={(sample) => {
              setRequestTargetSample(sample);
              setIsNewRequestOpen(true);
            }}
            onPrintLabel={(sample) => setPrintingSampleLabel(sample)}
          />
        )}

        {activeTab === "storage" && (
          <StorageView
            onInspectSample={handleInspectSampleById}
            onOpenAddSample={() => setIsAddSampleOpen(true)}
          />
        )}

        {activeTab === "requests" && (
          <RequestsView
            onOpenNewRequest={() => {
              setRequestTargetSample(null);
              setIsNewRequestOpen(true);
            }}
            onInspectRequest={(req) => setInspectingRequest(req)}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsView
            onInspectAlert={(alert) => setInspectingAlert(alert)}
            onInspectSample={handleInspectSampleById}
          />
        )}

        {activeTab === "activity" && (
          <ActivityView
            initialSampleId={activitySampleId}
            onInspectSample={handleInspectSampleById}
          />
        )}

        {activeTab === "expiry" && (
          <ExpiryDashboardView
            onInspectSample={handleInspectSampleById}
            onOpenNewRequest={(sample) => {
              setRequestTargetSample(sample);
              setIsNewRequestOpen(true);
            }}
            onNavigate={(tab) => setActiveTab(tab)}
            showToast={showToast}
          />
        )}

        {activeTab === "admin" && (
          user?.role === "admin" ? (
            <AdminView
              onNavigate={(tab) => setActiveTab(tab)}
              onInspectSample={handleInspectSampleById}
              showToast={showToast}
            />
          ) : (
            <div className="glass-panel animate-fade-in" style={{ padding: "48px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e11d48", marginBottom: "8px" }}>
                Restricted Administrative Console
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
                Your current account ({user?.roleLabel || user?.role}) does not have Level 4 Governance Clearance to access this module.
              </p>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="btn btn-primary"
              >
                Return to Clinical Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* Modals and Drawers */}
      {isAddSampleOpen && (
        <AddSampleModal
          onClose={() => setIsAddSampleOpen(false)}
          onSampleCreated={(newSample) => {
            showToast(`Specimen ${newSample.sampleId} registered successfully.`);
            fetchGlobalAlertCount();
            if (activeTab === "samples") {
              // Trigger re-fetch
              setActiveTab("samples");
            }
          }}
        />
      )}

      {isNewRequestOpen && (
        <NewRequestModal
          preselectedSample={requestTargetSample}
          onClose={() => setIsNewRequestOpen(false)}
          onRequestCreated={(newReq) => {
            showToast(`Requisition ${newReq.requestId} submitted for approval.`);
            setActiveTab("requests");
          }}
        />
      )}

      {inspectingSample && (
        <SampleDetailsDrawer
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onPrintLabel={(sample) => {
            setPrintingSampleLabel(sample);
          }}
          onRequestSample={(sample) => {
            setRequestTargetSample(sample);
            setIsNewRequestOpen(true);
            setInspectingSample(null);
          }}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            showToast(`Specimen ${updated.sampleId} updated.`);
            fetchGlobalAlertCount();
          }}
        />
      )}

      {inspectingRequest && (
        <RequestDetailsDrawer
          request={inspectingRequest}
          onClose={() => setInspectingRequest(null)}
          onRequestUpdated={(updated) => {
            setInspectingRequest(updated);
            showToast(`Requisition ${updated.requestId} status: ${updated.status}.`);
          }}
        />
      )}

      {inspectingAlert && (
        <AlertDetailsDrawer
          alert={inspectingAlert}
          onClose={() => setInspectingAlert(null)}
          onInspectSample={(sId) => {
            setInspectingAlert(null);
            handleInspectSampleById(sId);
          }}
          onAlertUpdated={(updated) => {
            setInspectingAlert(updated);
            showToast(`Alert ${updated.alertId} status: ${updated.status}.`);
            fetchGlobalAlertCount();
          }}
        />
      )}

      {printingSampleLabel && (
        <BarcodeLabelModal
          sample={printingSampleLabel}
          onClose={() => setPrintingSampleLabel(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 2000,
            boxShadow: "var(--shadow-lg)",
            border: `1px solid ${toast.type === "error" ? "rgba(244,63,94,0.5)" : "rgba(16,185,129,0.5)"}`,
            background: "rgba(10, 14, 23, 0.95)",
          }}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} color="#f43f5e" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{toast.message}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: "2px", marginLeft: "8px" }}
            onClick={() => setToast(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
