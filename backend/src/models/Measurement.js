const { Schema, model } = require("mongoose");

const measurementSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true },
    type: { type: String, required: true }, // e.g. "fasting_glucose", "systolic_bp"
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    referenceRange: {
      low: { type: Number },
      high: { type: Number },
    },
    takenAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Fast lookups for GET /measurements?type=&patientId=
measurementSchema.index({ patientId: 1, type: 1, takenAt: -1 });

module.exports = model("Measurement", measurementSchema);
