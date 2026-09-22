const { GoogleGenerativeAI } = require("@google/generative-ai");

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set — check your .env file");
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// Fixed suffix appended in CODE, not requested via the prompt. This
// guarantees the disclaimer is always present regardless of what the model
// returns — per Entry 04/10, this isn't optional framing, it's a hard
// requirement, so it can't depend on the model remembering to include it.
const DISCLAIMER = "This is not a diagnosis — discuss with a doctor.";

function buildThresholdPrompt(fact) {
  return `
A lab value has been flagged as outside its reference range by a deterministic
rule (not by you — you are only explaining an already-determined fact).

Test: ${fact.testType}
Value: ${fact.value} ${fact.unit}
Reference range: ${fact.referenceRange.low}–${fact.referenceRange.high} ${fact.unit}
This value is ${fact.direction} the reference range.

Write ONE short, plain sentence (under 20 words) saying what this generally
means, in everyday words a non-medical person would use — skip background
on what the test measures or how the body uses it. Do not diagnose, do not
speculate about individual causes, do not add reassurance or alarm beyond
the facts given, do not repeat the raw numbers back. Output plain text
only, no markdown, exactly one sentence.
`.trim();
}

function buildTrendPrompt(fact) {
  return `
A deterministic rule has flagged a meaningful change between two readings of
the same test (not flagged by you — you are only explaining an
already-determined fact).

Test: ${fact.testType}
Previous reading: ${fact.previousValue} ${fact.unit} (on ${new Date(fact.previousDate).toDateString()})
Latest reading: ${fact.latestValue} ${fact.unit} (on ${new Date(fact.latestDate).toDateString()})
Change: ${fact.percentChange > 0 ? "+" : ""}${fact.percentChange}%

Write 2-3 plain-language sentences explaining what a change of this kind
generally indicates. Do not diagnose, do not speculate about causes specific
to an individual, do not add reassurance or alarm beyond the facts given.
Output plain text only, no markdown.
`.trim();
}

/**
 * Generates plain-language explanation text for one already-flagged fact.
 * Deliberately takes ONLY the fact object — never the patient, never a
 * name or ID — so there is no code path by which patient identifiers could
 * reach the LLM call, per the Entry 10 privacy requirement.
 */
async function explainFlaggedFact(flaggedFact) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  });

  const prompt =
    flaggedFact.insightType === "threshold"
      ? buildThresholdPrompt(flaggedFact.fact)
      : buildTrendPrompt(flaggedFact.fact);

  const result = await model.generateContent(prompt);
  const modelText = result.response.text().trim();

  return `${modelText} ${DISCLAIMER}`;
}

module.exports = { explainFlaggedFact };