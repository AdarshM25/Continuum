const express = require("express");
const Insight = require("../models/Insight");
const { getMeasurementsGroupedByType } = require("../services/insights/aggregation");
const { runAllChecks } = require("../services/insights/ruleEngine");
const { explainFlaggedFact } = require("../services/insights/explanationLayer");

const router = express.Router();

/**
 * GET /insights
 * Requires: Authorization: Bearer <token>
 *
 * patientId comes from the authenticated token now, not a query param.
 * Runs the deterministic rule engine fresh every call (cheap — pure code,
 * no AI), but only calls the LLM for facts that don't already have an
 * Insight recorded (see dedupeKey on the model).
 */
router.get("/", async (req, res) => {
  try {
    const patientId = req.patientId;

    const grouped = await getMeasurementsGroupedByType(patientId);
    const flaggedFacts = runAllChecks(grouped);

    for (const fact of flaggedFacts) {
      const alreadyExists = await Insight.exists({
        patientId,
        type: fact.insightType,
        dedupeKey: fact.dedupeKey,
      });
      if (alreadyExists) continue;

      try {
        const aiText = await explainFlaggedFact(fact);
        await Insight.create({
          patientId,
          type: fact.insightType,
          sourceMeasurements: fact.sourceMeasurementIds,
          aiText,
          dedupeKey: fact.dedupeKey,
        });
      } catch (err) {
        console.error(`[insights] failed to generate explanation for ${fact.dedupeKey}:`, err.message);
      }
    }

    const feed = await Insight.find({ patientId }).sort({ generatedAt: -1 });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;