const { Schema, model } = require("mongoose");

const insightSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  type: {
    type: String,
    enum: ["threshold", "trend", "cycle_correlation"],
    required: true,
  },
  sourceMeasurements: [{ type: Schema.Types.ObjectId, ref: "Measurement" }],
  aiText: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },

  // Addition beyond the original Entry 07 schema: a stable key built from
  // (type + sorted sourceMeasurement ids) so GET /insights can tell "have I
  // already flagged this exact fact?" without re-running the LLM call every
  // poll. Without this, hitting the endpoint twice would generate two
  // insights for the same threshold breach.
  dedupeKey: { type: String, required: true },
});

insightSchema.index({ patientId: 1, type: 1, dedupeKey: 1 }, { unique: true });

module.exports = model("Insight", insightSchema);