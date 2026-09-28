import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true },
  notes: { type: String, default: "" },
});

const sampleRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    sampleId: { type: String, required: true },
    sampleType: { type: String, required: true },
    donorId: { type: String },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    department: { type: String, required: true },
    studyPurpose: { type: String, required: true },
    quantityRequested: { type: Number, required: true },
    unit: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Normal", "High", "Urgent"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: [
        "Requested",
        "Approved",
        "Retrieval In Progress",
        "Retrieved",
        "Returned",
        "Rejected",
      ],
      default: "Requested",
    },
    storageLocation: { type: String, default: "" },
    expectedReturnDate: { type: Date },
    approvalDate: { type: Date },
    approvedBy: { type: String },
    retrievedDate: { type: Date },
    retrievedBy: { type: String },
    handoverTo: { type: String },
    handoverNotes: { type: String, default: "" },
    returnedDate: { type: Date },
    rejectionReason: { type: String, default: "" },
    notes: { type: String, default: "" },
    history: [historySchema],
  },
  { timestamps: true }
);

export const SampleRequest = mongoose.model("SampleRequest", sampleRequestSchema);
