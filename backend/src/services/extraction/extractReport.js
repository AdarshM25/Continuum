const Report = require("../../models/Report");
const Measurement = require("../../models/Measurement");
const { extractMeasurementsFromFile } = require("./geminiClient");
const { normalizeType } = require("./typeNormalizer");
const { isPlausible } = require("./plausibility");
/**
 * Strips accidental markdown fences and parses the model's JSON response.
 * Gemini is instructed not to add fences, but models drift — this is a
 * cheap safety net, not a substitute for the prompt contract.
 */
function parseModelResponse(raw) {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("Model response was not a JSON array");
  }
  return parsed;
}

/**
 * Validates the fields we cannot safely guess. A missing type, value, or
 * unit means we drop the row — there's no safe default for those. A bad
 * or missing date is NOT fatal on its own (see runExtraction below): real
 * reports sometimes have unclear or placeholder dates, and losing an
 * otherwise-good measurement over that is worse than defaulting the date.
 */
function isValidCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return false;
  if (typeof candidate.type !== "string" || !candidate.type.trim()) return false;
  if (typeof candidate.value !== "number" || Number.isNaN(candidate.value)) return false;
  if (typeof candidate.unit !== "string" || !candidate.unit.trim()) return false;
  return true;
}

/**
 * Runs the full pipeline for one report: Gemini call -> validate -> persist
 * -> flip Report.extractionStatus. Designed to be called fire-and-forget
 * right after the upload responds (see routes/reports.js). For production
 * this in-process call should move behind a real job queue (BullMQ/etc)
 * so a server restart mid-extraction doesn't lose the job — flagged here
 * intentionally rather than papered over.
 */
async function runExtraction(reportId) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error(`Report ${reportId} not found`);

  try {
    const rawResponse = await extractMeasurementsFromFile(report.fileUrl, report.mimeType);
    console.log(`[extraction] raw Gemini response for report ${reportId}:\n${rawResponse}`);

    const candidates = parseModelResponse(rawResponse);
    console.log(`[extraction] parsed ${candidates.length} candidate(s) from report ${reportId}`);

    const rejected = candidates.filter((c) => !isValidCandidate(c));
    if (rejected.length > 0) {
      console.log(`[extraction] ${rejected.length} candidate(s) failed validation:`, JSON.stringify(rejected, null, 2));
    }

    const mappedRows = candidates
      .filter(isValidCandidate)
      .map((c) => {
        const parsedDate = typeof c.takenAt === "string" ? new Date(c.takenAt) : null;
        const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
        if (!hasValidDate) {
          console.log(
            `[extraction] "${c.type}" had an unparseable takenAt ("${c.takenAt}") — falling back to report upload date`
          );
        }

        return {
          patientId: report.patientId,
          reportId: report._id,
          type: normalizeType(c.type.trim().toLowerCase()),
          value: c.value,
          unit: c.unit.trim(),
          referenceRange:
            c.referenceRange &&
            typeof c.referenceRange.low === "number" &&
            typeof c.referenceRange.high === "number"
              ? c.referenceRange
              : undefined,
          takenAt: hasValidDate ? parsedDate : report.uploadedAt,
        };
      });

     const validRows = mappedRows.filter((row) => {
      const ok = isPlausible(row.type, row.value, row.unit);
      if (!ok) {
        console.log(
          `[extraction] dropped implausible value: ${row.type} = ${row.value} ${row.unit}`
        );
      }
      return ok;
    });

    if (validRows.length > 0) {
      await Measurement.insertMany(validRows);
    }

    report.extractionStatus = "done";
    report.extractionError = undefined;
    await report.save();

    return { insertedCount: validRows.length, droppedCount: candidates.length - validRows.length };
  } catch (err) {
    report.extractionStatus = "failed";
    report.extractionError = err.message;
    await report.save();
    throw err;
  }
}

module.exports = { runExtraction, parseModelResponse, isValidCandidate };