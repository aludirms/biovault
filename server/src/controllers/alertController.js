import { dataStore } from "../services/dataStore.js";

export const getAlerts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const alerts = await dataStore.getAlerts({ status });

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    next(err);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = req.user?.name || "Staff Member";

    const alert = await dataStore.acknowledgeAlert(id, operator);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      message: "Alert marked as acknowledged.",
      alert,
    });
  } catch (err) {
    next(err);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const operator = req.user?.name || "Staff Member";

    const alert = await dataStore.resolveAlert(id, resolutionNotes, operator);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      message: "Alert resolved successfully.",
      alert,
    });
  } catch (err) {
    next(err);
  }
};
