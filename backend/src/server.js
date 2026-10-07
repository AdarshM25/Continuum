const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Public routes
app.use("/auth", authRouter);

// Protected routes (require token)
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