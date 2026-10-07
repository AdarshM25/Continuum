const PLAUSIBLE_LIMITS = {
  fasting_glucose:   { unit: "mg/dl", min: 20, max: 600 },
  systolic_bp:       { unit: "mmhg",  min: 50, max: 260 },
  diastolic_bp:      { unit: "mmhg",  min: 30, max: 160 },
  hemoglobin:        { unit: "g/dl",  min: 3,  max: 25 },
  total_cholesterol: { unit: "mg/dl", min: 50, max: 600 },
  hdl_cholesterol:   { unit: "mg/dl", min: 10, max: 150 },
  ldl_cholesterol:   { unit: "mg/dl", min: 10, max: 500 },
  triglycerides:     { unit: "mg/dl", min: 20, max: 2000 },
};

function isPlausible(type, value, unit) {
  const limit = PLAUSIBLE_LIMITS[type];
  if (!limit) return true;

  const normalizedUnit = String(unit).trim().toLowerCase().replace(/\s+/g, "");
  if (normalizedUnit !== limit.unit) return true;

  return value >= limit.min && value <= limit.max;
}

module.exports = { isPlausible };