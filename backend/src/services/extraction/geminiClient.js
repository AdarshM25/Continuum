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

/**
 * Sends the uploaded file (PDF or image) to Gemini with the extraction
 * prompt and returns the raw text response. Parsing/validation happens
 * one layer up in extractReport.js — this function's only job is the API call.
 */
async function extractMeasurementsFromFile(filePath, mimeType) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const result = await model.generateContent([
    { text: EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  return result.response.text();
}

module.exports = { extractMeasurementsFromFile };
