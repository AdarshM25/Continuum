
const express = require("express");
const Measurement = require("../models/Measurement");

const router = express.Router();

/**
 * GET /measurements?type=
 * Requires: Authorization: Bearer <token>
 *
 * patientId no longer comes from the query string — it comes from the
 * authenticated token, so a patient can only ever see their own data.
 */
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { patientId: req.patientId };
    if (type) filter.type = type;

    const measurements = await Measurement.find(filter).sort({ takenAt: 1 });
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;