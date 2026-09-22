const { Schema, model } = require("mongoose");

const reportSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    fileUrl: { type: String, required: true }, // local path for now; swap for S3/GCS URL later
    originalName: { type: String },
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    extractionStatus: {
      type: String,
      enum: ["pending", "done", "failed"],
      default: "pending",
    },
    extractionError: { type: String }, // populated only when status = "failed"
  },
  { timestamps: true }
);

module.exports = model("Report", reportSchema);
