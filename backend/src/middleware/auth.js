const jwt = require("jsonwebtoken");

/**
 * Expects: Authorization: Bearer <token>
 * On success, attaches req.patientId so downstream routes never need to
 * trust a patientId supplied by the client directly — it always comes from
 * a verified token instead.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header. Expected: Bearer <token>" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.patientId = payload.patientId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;