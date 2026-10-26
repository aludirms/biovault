# BioVault — Biobank Specimen & Cryogenic Operations Management System

BioVault is a full-stack clinical repository and specimen lifecycle platform designed for biorepositories, academic biobanks, and molecular research cores. It tracks biological specimens across ultra-low temperature freezers and liquid nitrogen cryogenic vessels with automated chain-of-custody logging, role-based governance, and real-time viability forecasting.

---

## 🚀 Key Highlights & Modules

### 1. Specimen Inventory & Storage Topology
- **Interactive 9×9 Cryo-Box Matrix**: Visual grid representing physical freezer positions (Freezer $\rightarrow$ Rack $\rightarrow$ Box $\rightarrow$ Well slot).
- **Multi-Specimen Support**: Whole Blood, Blood Serum/Plasma, DNA/RNA Extracts, Biopsy Tissue, PBMCs, Cell Lines, and Synovial Fluids.
- **Barcode & Label Integration**: Auto-generated 2D barcode identifiers with print label generation.

### 2. Specimen Stability & Expiry Forecaster (30 / 60 / 90 Days)
- **Time-Horizon Viability Surveillance**: Proactively categorizes specimens approaching expiration into **Critical (< 30 days / Overdue)**, **Imminent (31–60 days)**, **Moderate (61–90 days)**, and **Cryo-Stable (> 90 days)**.
- **Degradation Velocity Tracking**: Visual progress bars showing percentage of clinical shelf-life consumed.
- **Automated Protocol Action Tags**: Recommends immediate quarantine, prioritization for pending protocols, or disposal review.
- **1-Click Forecast Export**: Instant CSV download for regulatory and laboratory planning reviews.

### 3. Biobank Administration & Governance Console
- **Role-Based Access Control (RBAC)**: Manage laboratory personnel across 4 clearance tiers:
  - *Biobank Administrator* (Full institutional control)
  - *Senior Lab Technician* (Specimen intake, physical storage, retrieval)
  - *Principal Investigator / Researcher* (Access requisitions, study allocation)
  - *QA Compliance Auditor* (Read-only, audit trail verification)
- **Cryogenic Safety Policies**: Monitored temperature thresholds (-80°C ultra-low alert at -70°C, LN2 cryo alert at -175°C).
- **Audit & Compliance Ledgers**: 1-click export of complete 21 CFR Part 11 audit logs and specimen ledgers to CSV.

### 4. Role-Based Authentication & Clearance Portals
- **First-Screen Access Gate**: Initial landing screen requires user authentication before accessing clinical data.
- **Dedicated Portals**: Dual-portal gateway for **Admin Portal** (Level 4 Governance Clearance) and **User / Staff Portal** (Level 2 Specimen Requisitions & Clinical Study Access).
- **Dynamic Role-Based UI (RBAC)**: Interface dynamically reflects clearance level—restricting administrative consoles and policy settings from standard user sessions.

### 5. Requisition Lifecycle & Chain of Custody
- **Multi-Stage Access Workflow**: Requested $\rightarrow$ Approved $\rightarrow$ Retrieval In Progress $\rightarrow$ Retrieved $\rightarrow$ Returned / Disposed.
- **Auditable Chain of Custody**: Chronological timeline assembling physical movement, custodian handoffs, temperature exposures, and approvals.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite 8, Lucide React icons, CSS Custom Properties (Clean Glass-Morphism Design System)
- **Backend**: Node.js, Express 5.2.1, JWT Authentication (`jsonwebtoken`), `bcryptjs`, ES Modules
- **Data Persistence**: **Dual-Mode Enterprise Architecture**
  - Mongoose models with validation and indexing prepared for production MongoDB clusters.
  - Built-in resilient in-memory data repository with rich clinical seed data for zero-downtime offline demonstrations and evaluations.

---

## ⚡ Quickstart Guide

### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

*The Express API will be running on `http://localhost:5000`.*

### 2. Start the Frontend Application

```bash
cd client
npm install
npm run dev
```

*The Vite web interface will be accessible at `http://localhost:5173`.*

---

## 👥 Demo Institutional Accounts

All demo accounts use the standard password: **`biovault123`**

| Role | Name | Email | Clearance |
|---|---|---|---|
| **Biobank Administrator** | Admin XYZ | `admin@biovault.org` | Level 4 — Full Admin Console |
| **Senior Lab Technician** | Technician ABC | `tech@biovault.org` | Level 3 — Storage & Handling |
| **Principal Investigator** | Researcher PQR | `researcher@biovault.org` | Level 2 — Requisitions |
| **QA Compliance Auditor** | Researcher PQR | `auditor@biovault.org` | Level 1 — Regulatory Audit |

---

## 📄 Regulatory Standards

BioVault's architectural patterns align with:
- **ISO 20387:2018** (Biotechnology — Biobanking requirements)
- **FDA 21 CFR Part 11** (Electronic records and tamper-evident audit trails)
- **GCLP** (Good Clinical Laboratory Practice)
