import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    sampleId: { type: String },
    requestId: { type: String },
    actionType: {
      type: String,
      required: true,
      enum: [
        "REGISTER",
        "UPDATE",
        "LOCATION_TRANSFER",
        "REQUEST_CREATED",
        "REQUEST_APPROVED",
        "SAMPLE_RETRIEVED",
        "SAMPLE_HANDOVER",
        "SAMPLE_RETURNED",
        "ALERT_GENERATED",
        "ALERT_RESOLVED",
        "STATUS_CHANGE",
        "DISPOSAL",
      ],
    },
    actionLabel: { type: String, required: true },
    performedBy: { type: String, required: true },
    role: { type: String, default: "Staff" },
    description: { type: String, required: true },
    location: { type: String, default: "" },
    details: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
