const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const TOKEN_EXPIRY = "7d";

function issueToken(patientId) {
  return jwt.sign({ patientId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * POST /auth/signup
 * body: { name, email, password, dob? }
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const existing = await Patient.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const patient = await Patient.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      dob,
      conditions: [],
      medications: [],
    });

    const token = issueToken(patient._id);
    res.status(201).json({ token, patientId: patient._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });
    // Same error for "no such user" and "wrong password" — don't reveal
    // which one it was, that's a minor but real account-enumeration leak.
    if (!patient) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, patient.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = issueToken(patient._id);
    res.json({ token, patientId: patient._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /auth/me
 * Requires: Authorization: Bearer <token>
 * The rest of /auth is deliberately public (signup/login need no token to
 * call) — this one route needs auth, applied directly here rather than on
 * the whole router.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.patientId).select("name email");
    if (!patient) return res.status(404).json({ error: "Not found" });
    res.json({ name: patient.name, email: patient.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;