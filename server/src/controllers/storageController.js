import { dataStore } from "../services/dataStore.js";

export const getFreezers = async (req, res, next) => {
  try {
    const freezers = await dataStore.getFreezers();
    res.json({
      success: true,
      count: freezers.length,
      freezers,
    });
  } catch (err) {
    next(err);
  }
};

export const getFreezerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const freezer = await dataStore.getFreezerById(id);

    if (!freezer) {
      return res.status(404).json({
        success: false,
        message: `Freezer unit '${id}' not found.`,
      });
    }

    res.json({
      success: true,
      freezer,
    });
  } catch (err) {
    next(err);
  }
};

export const getBoxGrid = async (req, res, next) => {
  try {
    const { freezerId, rackId, boxId } = req.params;
    const boxData = await dataStore.getBoxGrid(freezerId, rackId, boxId);

    res.json({
      success: true,
      ...boxData,
    });
  } catch (err) {
    next(err);
  }
};
