# CONTINUUM — Extraction Pipeline (Phase: Entry 03 / 07 / 08)

This is just the **extraction pipeline** slice of CONTINUUM: upload a lab
report → Gemini Vision reads it → structured `Measurement` records land in
MongoDB. Nothing else from the roadmap (auth, insights, sharing) is built
yet — that's intentional, this is step one.

## What's in here

```
src/
  config/db.js              MongoDB connection
  models/Patient.js         minimal patient doc (just enough to attach reports to)
  models/Report.js          the original upload + extractionStatus
  models/Measurement.js     one structured data point pulled from a report
  routes/reports.js         POST /reports, GET /reports/:id/status
  routes/measurements.js    GET /measurements?patientId=&type=  (to eyeball results)
  services/extraction/
    prompt.js                the strict JSON-only extraction prompt
    geminiClient.js           thin wrapper around the Gemini SDK call
    extractReport.js          orchestration: call model -> validate -> save -> update status
  server.js                  Express app entrypoint
```

## Setup

1. **Install Node.js** (v18+) if you don't have it, and MongoDB (or use a
   free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster instead of
   installing it locally — simpler if this is your first backend).

2. **Get a Gemini API key** (free tier): https://aistudio.google.com/apikey

3. Install dependencies:
   ```bash
   cd continuum-extraction
   npm install
   ```

4. Copy the env template and fill in your values:
   ```bash
   cp .env.example .env
   # then edit .env: MONGO_URI and GEMINI_API_KEY
   ```

5. Run it:
   ```bash
   npm run dev     # with nodemon, auto-restarts on file changes
   # or
   npm start
   ```

   You should see:
   ```
   [mongo] connected -> mongodb://...
   [server] listening on :4000
   ```

## Testing it manually

You need a `patientId` first since there's no auth/signup flow yet. Create
one directly via `mongosh` or Compass:

```js
db.patients.insertOne({ name: "Test Patient", conditions: [], medications: [] })
// copy the returned _id
```

Then upload a lab report PDF or photo:

```bash
curl -X POST http://localhost:4000/reports \
  -F "patientId=<paste the _id here>" \
  -F "file=@/path/to/a/lab-report.pdf"
```

You'll get back `{ reportId, extractionStatus: "pending" }` immediately.
Poll status:

```bash
curl http://localhost:4000/reports/<reportId>/status
```

Once it flips to `"done"`, check what got extracted:

```bash
curl "http://localhost:4000/measurements?patientId=<patientId>"
```

## What's deliberately NOT handled yet

These are flagged, not forgotten — they belong to later phases:

- **No auth** — `patientId` is passed in plain, no session/JWT. That's Phase 1 (Foundations).
- **No real job queue** — extraction runs as an in-process async call right
  after the upload responds. If the server restarts mid-extraction, that
  report is stuck on `"pending"` forever. Fine for a solo dev project /
  demo; swap in BullMQ + Redis before this goes further.
- **No file storage service** — uploads go to a local `uploads/` folder.
  Swap `multer.diskStorage` for S3/GCS when you're ready to deploy.
- **No retry logic** — a failed Gemini call just marks the report `"failed"`
  with the error message saved. No automatic retry.
- **Extraction prompt hasn't been tested against real report formats yet** —
  the field names in the JSON contract (`type`, `value`, `unit`,
  `referenceRange`, `takenAt`) match the Entry 07 schema exactly, but
  real-world report layouts vary a lot. Expect to iterate on
  `prompt.js` once you throw actual reports at it — this is the phase
  most likely to eat extra time (see the build roadmap notes).

## Next step

Once this is uploading and producing sane `Measurement` rows for a couple
of real report samples, the natural next phase is Entry 04 (rule-based
flagging + insight engine) reading from this same `Measurement` collection.
