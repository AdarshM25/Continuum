const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const { EXTRACTION_PROMPT } = require("./prompt");

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main model first, then the fallbacks from .env
function getModelList() {
  const main = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash-lite,gemini-3.1-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([main, ...fallbacks])]; // removes duplicates
}

/**
 * Sends the uploaded file (PDF or image) to Gemini with the extraction
 * prompt and returns the raw text response. If a model is busy (503) or
 * rate limited (429), it retries, then moves on to the next model.
 */
async function extractMeasurementsFromFile(filePath, mimeType) {
  const genAI = getClient();
  const base64Data = fs.readFileSync(filePath).toString("base64");

  const models = getModelList();
  const ATTEMPTS_PER_MODEL = 2;
  let lastError;

  for (const modelName of models) {
    const model = genAI.getGenerativeModel({ model: modelName }, { timeout: 45000 });
    
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent([
          { text: EXTRACTION_PROMPT },
          { inlineData: { mimeType, data: base64Data } },
        ]);
        if (modelName !== models[0]) {
          console.log(`[gemini] succeeded using fallback model ${modelName}`);
        }
        return result.response.text();
      } catch (err) {
        lastError = err;
        const message = String(err.message);
        const isBusy = message.includes("503") || message.includes("429");

        // Wrong key or bad request won't fix itself, so stop.
        if (!isBusy) throw err;

        // A 404 means this model name doesn't exist, so skip to the next one.
        if (attempt < ATTEMPTS_PER_MODEL) {
          const waitMs = 3000 * attempt;
          console.log(`[gemini] ${modelName} busy (attempt ${attempt}/${ATTEMPTS_PER_MODEL}), retrying in ${waitMs / 1000}s...`);
          await sleep(waitMs);
        } else {
          console.log(`[gemini] ${modelName} still busy, switching model...`);
        }
      }
    }
  }

  throw lastError; // every model was busy
}

module.exports = { extractMeasurementsFromFile };