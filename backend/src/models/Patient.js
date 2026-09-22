
const { Schema, model } = require("mongoose");

// email/passwordHash added here for auth. Note: any Patient created before
// this (e.g. by hand in Atlas during earlier testing) won't have these
// fields and can't log in — sign up a fresh account rather than trying to
// patch an old test doc.
const patientSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    dob: { type: Date },
    conditions: [{ type: String }],
    medications: [
      {
        name: String,
        dosage: String,
        startedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Patient", patientSchema);