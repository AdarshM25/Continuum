
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const reportsRouter = require("./routes/reports");
const measurementsRouter = require("./routes/measurements");
const insightsRouter = require("./routes/insights");
const requireAuth = require("./middleware/auth");

const app = express();

// Browsers block a page on one origin (localhost:5173, the frontend) from
// calling an API on another (localhost:4000, this server) unless the
// server explicitly allows it. This is that allowance — scoped to just the
// frontend's dev server address, not "allow everyone."
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Public — no token required to sign up or log in.
app.use("/auth", authRouter);

// Everything below this line requires a valid Bearer token.
app.use("/reports", requireAuth, reportsRouter);
app.use("/measurements", requireAuth, measurementsRouter);
app.use("/insights", requireAuth, insightsRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });