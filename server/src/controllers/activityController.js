import { dataStore } from "../services/dataStore.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const { sampleId, search, actionType, limit } = req.query;
    const logs = await dataStore.getActivityLogs({
      sampleId,
      search,
      actionType,
      limit: limit ? Number(limit) : 50,
    });

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

export const getChainOfCustody = async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    const data = await dataStore.getChainOfCustody(sampleId);

    if (!data.sample) {
      return res.status(404).json({
        success: false,
        message: `Sample '${sampleId}' not found in custody archives.`,
      });
    }

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};
