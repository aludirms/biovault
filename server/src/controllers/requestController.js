import { dataStore } from "../services/dataStore.js";

export const getRequests = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const requests = await dataStore.getRequests({ status, priority, search });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await dataStore.getRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Request '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (err) {
    next(err);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const operator = req.user?.name || req.body.requesterName || "Requester";
    const newRequest = await dataStore.createRequest(req.body, operator);

    res.status(201).json({
      success: true,
      message: "Sample requisition successfully submitted.",
      request: newRequest,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus, notes, handoverTo, rejectionReason } = req.body;
    const operator = req.user?.name || "Staff Member";

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: "Please specify 'newStatus' for the requisition workflow.",
      });
    }

    const updated = await dataStore.updateRequestStatus(id, {
      newStatus,
      operator,
      notes,
      handoverTo,
      rejectionReason,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Request '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      message: `Requisition transitioned to status: ${newStatus}`,
      request: updated,
    });
  } catch (err) {
    next(err);
  }
};
