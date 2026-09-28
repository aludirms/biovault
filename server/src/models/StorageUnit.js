import mongoose from "mongoose";

const storageUnitSchema = new mongoose.Schema(
  {
    freezerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    targetTemp: { type: Number, required: true },
    currentTemp: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Normal", "Warning", "Critical"],
      default: "Normal",
    },
    capacity: { type: Number, required: true },
    occupied: { type: Number, required: true, default: 0 },
    location: { type: String, required: true },
    racksCount: { type: Number, default: 6 },
    boxesPerRack: { type: Number, default: 10 },
    positionsPerBox: { type: Number, default: 81 },
    doorSensor: { type: String, default: "Closed" },
    lastDefrost: { type: String, default: "" },
  },
  { timestamps: true }
);

export const StorageUnit = mongoose.model("StorageUnit", storageUnitSchema);
