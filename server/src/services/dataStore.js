import { generateSeedData } from "../config/seedData.js";
import { getDBStatus } from "../config/db.js";
import { User } from "../models/User.js";
import { Sample } from "../models/Sample.js";
import { StorageUnit } from "../models/StorageUnit.js";
import { SampleRequest } from "../models/SampleRequest.js";
import { Alert } from "../models/Alert.js";
import { ActivityLog } from "../models/ActivityLog.js";

// In-Memory Data Store (Initialized with rich seed)
let memData = generateSeedData();

export const dataStore = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (getDBStatus()) {
      try {
        return await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        console.error("DB error finding user:", err);
      }
    }
    return memData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  async findUserById(id) {
    if (getDBStatus()) {
      try {
        return await User.findById(id);
      } catch (err) {
        console.error("DB error:", err);
      }
    }
    return memData.users.find((u) => u.id === id);
  },

  async createUser(userData) {
    if (getDBStatus()) {
      try {
        const newUser = new User(userData);
        return await newUser.save();
      } catch (err) {
        console.error("DB error creating user:", err);
      }
    }
    const user = {
      id: `usr-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
    };
    memData.users.push(user);
    return user;
  },

  async getAllUsers() {
    if (getDBStatus()) {
      try {
        return await User.find({}).select("-password");
      } catch (err) {}
    }
    return memData.users.map(({ password, ...rest }) => rest);
  },

  // --- SAMPLES ---
  async getSamples({ search, type, status, riskLevel, priorityLevel, freezerId, sortBy = "createdAt", sortOrder = "desc" } = {}) {
    let list = [...memData.samples];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.sampleId.toLowerCase().includes(q) ||
          s.donorId.toLowerCase().includes(q) ||
          s.study.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          (s.storageLocation?.freezerName && s.storageLocation.freezerName.toLowerCase().includes(q))
      );
    }

    if (type && type !== "All") {
      list = list.filter((s) => s.type === type);
    }

    if (status && status !== "All") {
      list = list.filter((s) => s.status === status);
    }

    if (riskLevel && riskLevel !== "All") {
      list = list.filter((s) => s.riskLevel === riskLevel);
    }

    if (priorityLevel && priorityLevel !== "All") {
      list = list.filter((s) => s.priorityLevel === priorityLevel);
    }

    if (freezerId && freezerId !== "All") {
      list = list.filter((s) => s.storageLocation?.freezerId === freezerId);
    }

    list.sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return list;
  },

  async getSampleById(sampleId) {
    return memData.samples.find(
      (s) => s.sampleId.toUpperCase() === sampleId.toUpperCase() || s.id === sampleId
    );
  },

  async createSample(sampleData, operator = "Staff") {
    const newSample = {
      id: `SMP-${Date.now().toString().slice(-4)}`,
      sampleId: sampleData.sampleId || `BV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      donorId: sampleData.donorId || `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
      type: sampleData.type,
      study: sampleData.study,
      collectionDate: sampleData.collectionDate || new Date().toISOString().split("T")[0],
      expiryDate: sampleData.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      quantity: Number(sampleData.quantity) || 1,
      unit: sampleData.unit || "mL",
      initialCondition: sampleData.initialCondition || "Optimal",
      currentCondition: sampleData.currentCondition || sampleData.initialCondition || "Optimal",
      status: sampleData.status || "Stored",
      storageLocation: {
        freezerId: sampleData.storageLocation?.freezerId || "F01",
        freezerName: sampleData.storageLocation?.freezerName || "Ultra-Low Freezer Alpha",
        rack: sampleData.storageLocation?.rack || "R01",
        box: sampleData.storageLocation?.box || "B01",
        position: sampleData.storageLocation?.position || "A1",
      },
      riskLevel: sampleData.riskLevel || "Low",
      priorityLevel: sampleData.priorityLevel || "Standard",
      attentionReason: sampleData.attentionReason || "",
      registeredBy: operator,
      notes: sampleData.notes || "",
      barcode: `BV-${sampleData.type ? sampleData.type.slice(0, 3).toUpperCase() : "SMP"}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    memData.samples.unshift(newSample);

    // Update freezer occupancy count
    const freezer = memData.freezers.find((f) => f.id === newSample.storageLocation.freezerId);
    if (freezer) {
      freezer.occupied = (freezer.occupied || 0) + 1;
    }

    // Auto-log activity
    await this.createActivityLog({
      sampleId: newSample.sampleId,
      actionType: "REGISTER",
      actionLabel: "Sample Registered",
      performedBy: operator,
      description: `Registered new ${newSample.type} sample (${newSample.sampleId}) into ${newSample.storageLocation.freezerId} / ${newSample.storageLocation.rack} / ${newSample.storageLocation.box} / ${newSample.storageLocation.position}.`,
      location: `${newSample.storageLocation.freezerId} / ${newSample.storageLocation.rack} / ${newSample.storageLocation.box} / ${newSample.storageLocation.position}`,
    });

    return newSample;
  },

  async updateSample(sampleId, updates, operator = "Staff") {
    const index = memData.samples.findIndex(
      (s) => s.sampleId.toUpperCase() === sampleId.toUpperCase() || s.id === sampleId
    );
    if (index === -1) return null;

    const prev = memData.samples[index];
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    memData.samples[index] = updated;

    let actionLabel = "Sample Updated";
    let desc = `Updated sample ${updated.sampleId} metadata.`;

    if (updates.storageLocation && (updates.storageLocation.position !== prev.storageLocation?.position || updates.storageLocation.box !== prev.storageLocation?.box)) {
      actionLabel = "Location Transferred";
      desc = `Relocated sample from ${prev.storageLocation.freezerId}/${prev.storageLocation.rack}/${prev.storageLocation.box}/${prev.storageLocation.position} to ${updates.storageLocation.freezerId}/${updates.storageLocation.rack}/${updates.storageLocation.box}/${updates.storageLocation.position}.`;
      await this.createActivityLog({
        sampleId: updated.sampleId,
        actionType: "LOCATION_TRANSFER",
        actionLabel,
        performedBy: operator,
        description: desc,
        location: `${updates.storageLocation.freezerId}/${updates.storageLocation.rack}/${updates.storageLocation.box}/${updates.storageLocation.position}`,
      });
    } else {
      await this.createActivityLog({
        sampleId: updated.sampleId,
        actionType: "UPDATE",
        actionLabel,
        performedBy: operator,
        description: desc,
        location: `${updated.storageLocation?.freezerId}/${updated.storageLocation?.rack}/${updated.storageLocation?.box}/${updated.storageLocation?.position}`,
      });
    }

    return updated;
  },

  async deleteSample(sampleId, operator = "Staff") {
    const index = memData.samples.findIndex(
      (s) => s.sampleId.toUpperCase() === sampleId.toUpperCase() || s.id === sampleId
    );
    if (index === -1) return false;
    const removed = memData.samples.splice(index, 1)[0];

    await this.createActivityLog({
      sampleId: removed.sampleId,
      actionType: "DISPOSAL",
      actionLabel: "Sample Disposed/Removed",
      performedBy: operator,
      description: `Sample ${removed.sampleId} was removed/disposed from ${removed.storageLocation?.freezerId}.`,
      location: `${removed.storageLocation?.freezerId}/${removed.storageLocation?.rack}`,
    });

    return true;
  },

  // --- STORAGE UNITS ---
  async getFreezers() {
    return memData.freezers;
  },

  async getFreezerById(id) {
    return memData.freezers.find((f) => f.id === id);
  },

  async getBoxGrid(freezerId, rackId, boxId) {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Find all samples in this specific freezer, rack, box
    const boxSamples = memData.samples.filter(
      (s) =>
        s.storageLocation?.freezerId === freezerId &&
        s.storageLocation?.rack === rackId &&
        s.storageLocation?.box === boxId
    );

    const matrix = [];
    for (const r of rows) {
      const rowCells = [];
      for (const c of cols) {
        const posCode = `${r}${c}`;
        const sample = boxSamples.find((s) => s.storageLocation?.position === posCode);
        rowCells.push({
          position: posCode,
          row: r,
          col: c,
          isOccupied: Boolean(sample),
          sample: sample || null,
        });
      }
      matrix.push(rowCells);
    }

    return {
      freezerId,
      rackId,
      boxId,
      totalPositions: 81,
      occupiedPositions: boxSamples.length,
      availablePositions: 81 - boxSamples.length,
      grid: matrix,
      samples: boxSamples,
    };
  },

  // --- REQUESTS ---
  async getRequests({ status, priority, search } = {}) {
    let list = [...memData.requests];

    if (status && status !== "All") {
      list = list.filter((r) => r.status === status);
    }

    if (priority && priority !== "All") {
      list = list.filter((r) => r.priority === priority);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestId.toLowerCase().includes(q) ||
          r.sampleId.toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q) ||
          r.studyPurpose.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  },

  async getRequestById(requestId) {
    return memData.requests.find(
      (r) => r.requestId.toUpperCase() === requestId.toUpperCase() || r.id === requestId
    );
  },

  async createRequest(reqData, operator = "Requester") {
    const sample = await this.getSampleById(reqData.sampleId);
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requestId: reqData.requestId || `REQ-2026-00${Math.floor(50 + Math.random() * 50)}`,
      sampleId: reqData.sampleId,
      sampleType: sample?.type || reqData.sampleType || "Biological Sample",
      donorId: sample?.donorId || "N/A",
      requesterName: reqData.requesterName || operator,
      requesterEmail: reqData.requesterEmail || "researcher@biovault.org",
      department: reqData.department || "Oncology Core",
      studyPurpose: reqData.studyPurpose || "Genomic Sequencing",
      quantityRequested: Number(reqData.quantityRequested) || 1,
      unit: reqData.unit || sample?.unit || "vials",
      priority: reqData.priority || "Normal",
      status: "Requested",
      storageLocation: sample?.storageLocation
        ? `${sample.storageLocation.freezerId} / ${sample.storageLocation.rack} / ${sample.storageLocation.box} / ${sample.storageLocation.position}`
        : "F01 / R01 / B01 / A1",
      expectedReturnDate: reqData.expectedReturnDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
      approvalDate: null,
      approvedBy: null,
      retrievedDate: null,
      retrievedBy: null,
      handoverTo: null,
      handoverNotes: "",
      returnedDate: null,
      rejectionReason: "",
      notes: reqData.notes || "",
      createdAt: new Date().toISOString(),
      history: [
        {
          stage: "Requested",
          timestamp: new Date().toISOString(),
          user: reqData.requesterName || operator,
          notes: reqData.notes || "Requisition submitted into BioVault.",
        },
      ],
    };

    memData.requests.unshift(newReq);

    await this.createActivityLog({
      sampleId: newReq.sampleId,
      requestId: newReq.requestId,
      actionType: "REQUEST_CREATED",
      actionLabel: "Sample Request Created",
      performedBy: operator,
      description: `Created sample request ${newReq.requestId} for ${newReq.sampleId} (${newReq.studyPurpose}).`,
      location: newReq.storageLocation,
    });

    return newReq;
  },

  async updateRequestStatus(requestId, { newStatus, operator = "Staff", notes = "", handoverTo = "", rejectionReason = "" }) {
    const index = memData.requests.findIndex(
      (r) => r.requestId.toUpperCase() === requestId.toUpperCase() || r.id === requestId
    );
    if (index === -1) return null;

    const req = memData.requests[index];
    req.status = newStatus;
    const now = new Date().toISOString();

    if (newStatus === "Approved") {
      req.approvalDate = now;
      req.approvedBy = operator;
    } else if (newStatus === "Retrieval In Progress") {
      req.retrievedDate = now;
      req.retrievedBy = operator;
    } else if (newStatus === "Retrieved") {
      req.handoverTo = handoverTo || req.requesterName;
      req.handoverNotes = notes;
      // Mark sample as In-Transit / Retrieved
      const sample = memData.samples.find((s) => s.sampleId === req.sampleId);
      if (sample) sample.status = "Retrieved";
    } else if (newStatus === "Returned") {
      req.returnedDate = now;
      const sample = memData.samples.find((s) => s.sampleId === req.sampleId);
      if (sample) sample.status = "Stored";
    } else if (newStatus === "Rejected") {
      req.rejectionReason = rejectionReason || notes || "Request rejected by Biobank administrator.";
    }

    req.history.push({
      stage: newStatus,
      timestamp: now,
      user: operator,
      notes: notes || `Request transitioned to ${newStatus}.`,
    });

    memData.requests[index] = req;

    // Log corresponding activity
    const actionTypeMap = {
      Approved: "REQUEST_APPROVED",
      "Retrieval In Progress": "SAMPLE_RETRIEVED",
      Retrieved: "SAMPLE_HANDOVER",
      Returned: "SAMPLE_RETURNED",
      Rejected: "STATUS_CHANGE",
    };

    await this.createActivityLog({
      sampleId: req.sampleId,
      requestId: req.requestId,
      actionType: actionTypeMap[newStatus] || "UPDATE",
      actionLabel: `Request ${newStatus}`,
      performedBy: operator,
      description: `Request ${req.requestId} for sample ${req.sampleId} status updated to '${newStatus}'. ${notes}`,
      location: req.storageLocation,
    });

    return req;
  },

  // --- ALERTS ---
  async getAlerts({ status } = {}) {
    let list = [...memData.alerts];
    if (status && status !== "All") {
      list = list.filter((a) => a.status === status);
    }
    return list;
  },

  async acknowledgeAlert(alertId, operator = "Staff") {
    const alert = memData.alerts.find((a) => a.alertId === alertId || a.id === alertId);
    if (!alert) return null;
    alert.status = "Acknowledged";

    await this.createActivityLog({
      actionType: "UPDATE",
      actionLabel: "Alert Acknowledged",
      performedBy: operator,
      description: `Alert ${alert.alertId} (${alert.title}) was acknowledged by staff.`,
      location: alert.freezerName || "Biobank",
    });

    return alert;
  },

  async resolveAlert(alertId, resolutionNotes = "", operator = "Staff") {
    const alert = memData.alerts.find((a) => a.alertId === alertId || a.id === alertId);
    if (!alert) return null;
    alert.status = "Resolved";

    // If it was temperature alert, normalize freezer status
    if (alert.freezerId) {
      const freezer = memData.freezers.find((f) => f.id === alert.freezerId);
      if (freezer && freezer.status === "Warning") {
        freezer.status = "Normal";
        freezer.currentTemp = freezer.targetTemp;
      }
    }

    await this.createActivityLog({
      actionType: "ALERT_RESOLVED",
      actionLabel: "Alert Resolved",
      performedBy: operator,
      description: `Alert ${alert.alertId} (${alert.title}) was marked resolved. Notes: ${resolutionNotes}`,
      location: alert.freezerName || "Biobank",
    });

    return alert;
  },

  // --- ACTIVITY LOGS & CHAIN OF CUSTODY ---
  async createActivityLog({ sampleId, requestId, actionType, actionLabel, performedBy, role = "Staff", description, location }) {
    const newLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      sampleId: sampleId || null,
      requestId: requestId || null,
      actionType: actionType || "UPDATE",
      actionLabel: actionLabel || "System Event",
      performedBy: performedBy || "BioVault System",
      role: role || "Staff",
      description: description || "Action logged.",
      location: location || "",
      timestamp: new Date().toISOString(),
    };
    memData.activityLogs.unshift(newLog);
    return newLog;
  },

  async getActivityLogs({ sampleId, search, actionType, limit = 50 } = {}) {
    let list = [...memData.activityLogs];

    if (sampleId) {
      list = list.filter((l) => l.sampleId === sampleId);
    }

    if (actionType && actionType !== "All") {
      list = list.filter((l) => l.actionType === actionType);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          (l.sampleId && l.sampleId.toLowerCase().includes(q)) ||
          (l.requestId && l.requestId.toLowerCase().includes(q)) ||
          l.performedBy.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    return list.slice(0, limit);
  },

  async getChainOfCustody(sampleId) {
    const sample = await this.getSampleById(sampleId);
    const relatedLogs = memData.activityLogs.filter((l) => l.sampleId === sampleId);
    const relatedRequests = memData.requests.filter((r) => r.sampleId === sampleId);

    // Build chronological timeline events
    const timeline = [];

    // 1. Initial Registration
    if (sample) {
      timeline.push({
        stage: "Sample Registered",
        timestamp: sample.createdAt,
        operator: sample.registeredBy,
        role: "Registrar",
        location: `${sample.storageLocation?.freezerName} (${sample.storageLocation?.rack}/${sample.storageLocation?.box}/${sample.storageLocation?.position})`,
        details: `Initial check-in: ${sample.quantity} ${sample.unit} of ${sample.type} under study ${sample.study}. Condition: ${sample.initialCondition}.`,
        status: "Completed",
      });
    }

    // 2. Add activity logs
    for (const log of relatedLogs) {
      if (log.actionType !== "REGISTER") {
        timeline.push({
          stage: log.actionLabel,
          timestamp: log.timestamp,
          operator: log.performedBy,
          role: log.role,
          location: log.location || "BioVault Facility",
          details: log.description,
          status: "Completed",
        });
      }
    }

    // 3. Add request lifecycle milestones
    for (const req of relatedRequests) {
      for (const h of req.history || []) {
        if (h.stage !== "Requested") {
          timeline.push({
            stage: `Request [${req.requestId}] - ${h.stage}`,
            timestamp: h.timestamp,
            operator: h.user,
            role: "Handler",
            location: req.storageLocation,
            details: h.notes || `Requisition for: ${req.studyPurpose}`,
            status: "Completed",
          });
        }
      }
    }

    // Sort chronologically ascending
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      sample,
      totalEvents: timeline.length,
      currentLocation: sample?.storageLocation,
      currentStatus: sample?.status,
      timeline,
    };
  },

  // --- DASHBOARD OVERVIEW METRICS ---
  async getDashboardMetrics() {
    const totalSamples = memData.samples.length;
    const storedSamples = memData.samples.filter((s) => s.status === "Stored").length;
    const availableSamples = memData.samples.filter((s) => s.status === "Stored" && s.riskLevel !== "Critical").length;
    const inTransitSamples = memData.samples.filter((s) => s.status === "In-Transit" || s.status === "Retrieved").length;
    const pendingRequests = memData.requests.filter((r) => r.status === "Requested" || r.status === "Approved" || r.status === "Retrieval In Progress").length;
    const highRiskSamples = memData.samples.filter((s) => s.riskLevel === "High" || s.riskLevel === "Critical").length;
    const urgentSamples = memData.samples.filter((s) => s.priorityLevel === "Urgent").length;

    // Attention list: High Risk or Urgent priority
    const attentionSamples = memData.samples
      .filter((s) => s.riskLevel === "High" || s.riskLevel === "Critical" || s.priorityLevel === "Urgent")
      .map((s) => ({
        ...s,
        attentionCategory: s.priorityLevel === "Urgent" ? "Urgent Priority" : "High Risk",
      }));

    // Storage status
    const totalCapacity = memData.freezers.reduce((acc, f) => acc + f.capacity, 0);
    const totalOccupied = memData.freezers.reduce((acc, f) => acc + f.occupied, 0);
    const overallOccupancyRate = ((totalOccupied / totalCapacity) * 100).toFixed(1);
    const abnormalFreezers = memData.freezers.filter((f) => f.status !== "Normal").length;

    // Active Alerts count
    const activeAlertsCount = memData.alerts.filter((a) => a.status === "Active").length;

    // Recent activities (top 6)
    const recentActivity = memData.activityLogs.slice(0, 6);

    return {
      metrics: {
        totalSamples,
        storedSamples,
        availableSamples,
        inTransitSamples,
        pendingRequests,
        highRiskSamples,
        urgentSamples,
        activeAlertsCount,
        abnormalFreezers,
        overallOccupancyRate,
      },
      attentionSamples,
      freezers: memData.freezers,
      recentActivity,
      activeAlerts: memData.alerts.filter((a) => a.status === "Active"),
    };
  },
};
