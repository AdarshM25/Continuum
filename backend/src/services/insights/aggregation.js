const Measurement = require("../../models/Measurement");

/**
 * Fetches all of a patient's measurements and groups them by `type`,
 * each group sorted oldest -> newest. This is the one place that reads
 * raw Measurement data for the insight engine — rule checks operate on
 * what this returns, never query Measurement directly.
 *
 * Returns: { [type]: [ { _id, value, unit, referenceRange, takenAt }, ... ] }
 */
async function getMeasurementsGroupedByType(patientId) {
  const measurements = await Measurement.find({ patientId }).sort({ takenAt: 1 }).lean();

  const grouped = {};
  for (const m of measurements) {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m);
  }
  return grouped;
}

module.exports = { getMeasurementsGroupedByType };