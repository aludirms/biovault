import { dataStore } from "../services/dataStore.js";

export const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await dataStore.getDashboardMetrics();
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};
