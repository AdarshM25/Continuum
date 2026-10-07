// This file contains NO AI calls, by design (Entry 04). It only decides
// WHAT is flagged. The explanation layer (explanationLayer.js) decides
// HOW to describe a flag in plain language — that separation is the
// actual design decision worth defending in viva, not an implementation
// detail: a rules engine can't hallucinate a false "abnormal" reading.

// Trend threshold: a change of this % or more since the previous reading
// of the same type counts as a flaggable trend. Deliberately simple and
// uniform across all measurement types for now — a real product would
// tune this per test (a 15% swing means very different things for
// hemoglobin vs. cholesterol), but a single tunable constant is an honest
// starting point, not a hidden assumption.
const TREND_CHANGE_THRESHOLD_PERCENT = 15;

// Severity cutoffs. Like the trend threshold, these are uniform, tunable
// placeholders, NOT clinical standards. A real product would set them per
// test with medical input. Naming them as constants keeps that honest.
//
// Threshold severity = how far the value sits OUTSIDE its reference range,
// as a % of the bound it crossed.
const THRESHOLD_MODERATE_PERCENT = 10;
const THRESHOLD_HIGH_PERCENT = 25;

// Trend severity = size of the % change between the last two readings.
const TREND_MODERATE_PERCENT = 30;
const TREND_HIGH_PERCENT = 50;

/**
 * Maps a magnitude (a percentage) to "mild" | "moderate" | "high".
 * Anything that is already flagged is at least "mild".
 */
function severityFromMagnitude(magnitude, moderateCutoff, highCutoff) {
  if (magnitude >= highCutoff) return "high";
  if (magnitude >= moderateCutoff) return "moderate";
  return "mild";
}

/**
 * Severity of an out-of-range value: distance past the crossed bound,
 * as a % of that bound.
 */
function thresholdSeverity(value, low, high) {
  const bound = value < low ? low : high;
  const distance = Math.abs(value - bound);
  // If the bound is 0 a percentage is meaningless, so fall back to the range width.
  const base = bound !== 0 ? Math.abs(bound) : high - low;
  if (!base) return "mild";
  return severityFromMagnitude(
    (distance / base) * 100,
    THRESHOLD_MODERATE_PERCENT,
    THRESHOLD_HIGH_PERCENT
  );
}

/**
 * Checks one measurement against its own reference range, if it has one.
 * Returns a flagged-fact object, or null if not flagged / no range to check.
 */
function checkThreshold(measurement) {
  if (!measurement.referenceRange) return null;
  const { low, high } = measurement.referenceRange;
  if (typeof low !== "number" || typeof high !== "number") return null;

  const { value } = measurement;
  if (value >= low && value <= high) return null; // within range, nothing to flag

  const direction = value < low ? "below" : "above";

  return {
    insightType: "threshold",
    severity: thresholdSeverity(value, low, high),
    sourceMeasurementIds: [measurement._id],
    dedupeKey: String(measurement._id),
    fact: {
      testType: measurement.type,
      value,
      unit: measurement.unit,
      referenceRange: { low, high },
      direction,
      takenAt: measurement.takenAt,
    },
  };
}

/**
 * Checks the most recent two readings of the same type for a meaningful
 * change. Skips the check (rather than guessing) when units differ between
 * the two readings — e.g. one report says "cumm" and another says
 * "thou/mm3" for the same test type. Comparing raw numbers across
 * mismatched units would silently produce a nonsense percentage; there's
 * no unit-conversion table here yet, so we decline rather than fabricate.
 */
function checkTrend(seriesForOneType) {
  if (seriesForOneType.length < 2) return null;

  const previous = seriesForOneType[seriesForOneType.length - 2];
  const latest = seriesForOneType[seriesForOneType.length - 1];

  if (previous.unit !== latest.unit) {
    console.log(
      `[insights] skipping trend check for "${latest.type}" — mismatched units ("${previous.unit}" vs "${latest.unit}")`
    );
    return null;
  }
  if (previous.value === 0) return null; // avoid divide-by-zero

  const percentChange = ((latest.value - previous.value) / previous.value) * 100;
  if (Math.abs(percentChange) < TREND_CHANGE_THRESHOLD_PERCENT) return null;

  return {
    insightType: "trend",
    severity: severityFromMagnitude(
      Math.abs(percentChange),
      TREND_MODERATE_PERCENT,
      TREND_HIGH_PERCENT
    ),
    sourceMeasurementIds: [previous._id, latest._id],
    dedupeKey: `${previous._id}_${latest._id}`,
    fact: {
      testType: latest.type,
      unit: latest.unit,
      previousValue: previous.value,
      previousDate: previous.takenAt,
      latestValue: latest.value,
      latestDate: latest.takenAt,
      percentChange: Math.round(percentChange * 10) / 10,
    },
  };
}

/**
 * Runs every deterministic check across a patient's full grouped measurement
 * set and returns the flat list of flagged facts. This is the only function
 * the route needs to call — it owns the "run everything" orchestration.
 */
function runAllChecks(groupedMeasurements) {
  const flagged = [];

  for (const type of Object.keys(groupedMeasurements)) {
    const series = groupedMeasurements[type];

    for (const measurement of series) {
      const thresholdFlag = checkThreshold(measurement);
      if (thresholdFlag) flagged.push(thresholdFlag);
    }

    const trendFlag = checkTrend(series);
    if (trendFlag) flagged.push(trendFlag);
  }

  return flagged;
}

module.exports = {
  checkThreshold,
  checkTrend,
  runAllChecks,
  TREND_CHANGE_THRESHOLD_PERCENT,
  THRESHOLD_MODERATE_PERCENT,
  THRESHOLD_HIGH_PERCENT,
  TREND_MODERATE_PERCENT,
  TREND_HIGH_PERCENT,
};