import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "TEMPERATURE_EXCURSION",
        "CAPACITY_WARNING",
        "EXPIRY_WARNING",
        "SAMPLE_INTEGRITY",
        "DOOR_AJAR",
      ],
    },
    severity: {
      type: String,
      enum: ["Info", "Warning", "High", "Critical"],
      default: "Warning",
    },
    freezerId: { type: String },
    freezerName: { type: String },
    sampleId: { type: String },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Acknowledged", "Resolved"],
      default: "Active",
    },
    affectedSamplesCount: { type: Number, default: 0 },
    actionRequired: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Alert = mongoose.model("Alert", alertSchema);
