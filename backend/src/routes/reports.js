const mongoose = require("mongoose");
const express = require("express");
const Report = require("../models/Report");
const upload = require("../middleware/upload");
const { runExtraction } = require("../services/extraction/extractReport");

const router = express.Router();

/**
 * POST /reports
 * Requires: Authorization: Bearer <token>
 * multipart/form-data: file=<the scan/PDF>
 *
 * patientId is no longer taken from the request body — it comes from the
 * verified token (req.patientId, set by the requireAuth middleware in
 * server.js). This closes off the old possibility of uploading a report
 * under someone else's patientId just by typing a different ID.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "A file is required (field name: file)" });
    }

    const report = await Report.create({
      patientId: req.patientId,
      fileUrl: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      extractionStatus: "pending",
    });

    res.status(201).json({ reportId: report._id, extractionStatus: report.extractionStatus });

    // Fire-and-forget. See the note in extractReport.js about replacing
    // this with a real job queue before this goes anywhere near production.
    runExtraction(report._id).catch((err) => {
      console.error(`[extraction] report ${report._id} failed:`, err.message);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /reports
 * Requires: Authorization: Bearer <token>
 *
 * Lists every report the logged-in patient has uploaded, newest first.
 * This is what makes upload history visible — measurements from every
 * report were already being combined for the dashboard, but there was no
 * way to see the reports themselves (dates, filenames, status) as a list.
 */
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.patientId })
      .select("originalName mimeType uploadedAt extractionStatus")
      .sort({ uploadedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 

/**
 * GET /reports/:id/status
 * Requires: Authorization: Bearer <token>
 *
 * Ownership check: a report belongs to the patient who uploaded it. Without
 * this, any logged-in patient could poll any reportId and see someone
 * else's extraction status — a real (if minor) data leak, not just a
 * theoretical one, so it's worth the extra check rather than skipping it.
 */
router.get("/:id/status", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).select(
      "patientId extractionStatus extractionError uploadedAt"
    );
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (String(report.patientId) !== String(req.patientId)) {
      return res.status(403).json({ error: "You do not have access to this report" });
    }

    res.json({
      extractionStatus: report.extractionStatus,
      extractionError: report.extractionError,
      uploadedAt: report.uploadedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;