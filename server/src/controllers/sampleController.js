import { dataStore } from "../services/dataStore.js";

export const getSamples = async (req, res, next) => {
  try {
    const { search, type, status, riskLevel, priorityLevel, freezerId, sortBy, sortOrder } = req.query;
    const samples = await dataStore.getSamples({
      search,
      type,
      status,
      riskLevel,
      priorityLevel,
      freezerId,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      count: samples.length,
      samples,
    });
  } catch (err) {
    next(err);
  }
};

export const getSampleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sample = await dataStore.getSampleById(id);

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Sample with ID '${id}' not found in biobank inventory.`,
      });
    }

    res.json({
      success: true,
      sample,
    });
  } catch (err) {
    next(err);
  }
};

export const createSample = async (req, res, next) => {
  try {
    const operator = req.user?.name || "Staff Member";
    const newSample = await dataStore.createSample(req.body, operator);

    res.status(201).json({
      success: true,
      message: "Sample successfully registered into biobank inventory.",
      sample: newSample,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = req.user?.name || "Staff Member";

    const updated = await dataStore.updateSample(id, req.body, operator);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Sample '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      message: "Sample successfully updated.",
      sample: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = req.user?.name || "Staff Member";

    const success = await dataStore.deleteSample(id, operator);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Sample '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      message: "Sample record has been logged for disposal/removal.",
    });
  } catch (err) {
    next(err);
  }
};
