// The one prompt that turns a scanned/PDF lab report into a strict JSON array
// of Measurement candidates. Keep this deterministic and narrow — this call
// does NOT get to interpret, flag, or advise. That happens later in the
// rules engine (Entry 04), never here.

const EXTRACTION_PROMPT = `
You are a document parser for a medical lab report. Extract every discrete
numeric measurement you can find (e.g. blood test values, vitals, blood
pressure readings). Do NOT diagnose, interpret, or comment on the values.

Return ONLY a JSON array (no markdown fences, no prose) where each element
has exactly this shape:

{
  "type": "snake_case_measurement_name",   // e.g. "fasting_glucose", "systolic_bp", "hemoglobin"
  "value": 0,                               // numeric value only
  "unit": "string",                         // e.g. "mg/dL", "mmHg", "g/dL"
  "referenceRange": { "low": 0, "high": 0 },// omit this field entirely if the report doesn't state a range
  "takenAt": "YYYY-MM-DD"                   // date the sample was taken/reported; use report date if no other date is present
}

Rules:
- If you cannot confidently find a value, unit, or date, omit that measurement entirely rather than guessing.
- Split combined readings (e.g. "120/80 mmHg") into two entries: "systolic_bp" and "diastolic_bp".
- Use snake_case, lowercase types. Be consistent: "fasting_glucose" not "Fasting Glucose (mg/dL)".
- Return [] if no measurements are found.
- Output must be valid JSON and nothing else.
`.trim();

module.exports = { EXTRACTION_PROMPT };
