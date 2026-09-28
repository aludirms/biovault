import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "technician", "researcher", "auditor"],
      default: "technician",
    },
    roleLabel: { type: String, default: "Lab Staff" },
    department: { type: String, default: "Bio-Repository Core" },
    avatar: { type: String, default: "BV" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
