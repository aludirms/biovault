import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    sampleId: { type: String, required: true, unique: true },
    donorId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "Whole Blood",
        "Blood Serum",
        "Blood Plasma",
        "DNA Extract",
        "RNA Extract",
        "Biopsy Tissue",
        "Cell Line",
        "PBMC",
        "Synovial Fluid",
        "Urine",
        "Saliva",
        "Other",
      ],
    },
    study: { type: String, required: true },
    collectionDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "mL" },
    initialCondition: { type: String, default: "Optimal" },
    currentCondition: { type: String, default: "Optimal" },
    status: {
      type: String,
      enum: ["Stored", "In-Transit", "Retrieved", "Quarantined", "Disposed"],
      default: "Stored",
    },
    storageLocation: {
      freezerId: { type: String, required: true },
      freezerName: { type: String, required: true },
      rack: { type: String, required: true },
      box: { type: String, required: true },
      position: { type: String, required: true },
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    priorityLevel: {
      type: String,
      enum: ["Standard", "High", "Urgent"],
      default: "Standard",
    },
    attentionReason: { type: String, default: "" },
    registeredBy: { type: String, required: true },
    notes: { type: String, default: "" },
    barcode: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Sample = mongoose.model("Sample", sampleSchema);
