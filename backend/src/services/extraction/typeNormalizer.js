// Different labs print different labels for the same test — e.g. Dr Lal
// PathLabs writes "Total Leukocyte Count (TLC)" while another lab writes
// "Total WBC Count". Gemini faithfully transcribes whatever label it sees,
// so without this step, the same measurement type would fragment into
// multiple type values across reports, breaking any trend/history query
// downstream (insight engine, dashboard charts).
//
// This is necessarily incomplete — it only knows the synonyms we've seen
// so far. Add to it as new reports surface new label variants; an unknown
// type is NOT dropped, it just passes through unmapped (see normalizeType).

const CANONICAL_TYPES = {
  wbc_count: ["total_wbc_count", "total_leukocyte_count", "tlc", "leukocyte_count", "wbc_count"],
  rbc_count: ["rbc_count", "total_rbc_count", "red_blood_cell_count"],
  rdw: ["rdw", "red_cell_distribution_width", "red_cell_distribution_width_cv", "rdw_cv", "rdw_sd"],
  mcv: ["mcv", "mean_corpuscular_volume"],
  mch: ["mch", "mean_corpuscular_hemoglobin"],
  mchc: ["mchc", "mean_corpuscular_hemoglobin_concentration"],
  pcv: ["pcv", "packed_cell_volume", "hematocrit", "hct"],
  neutrophils: ["neutrophils", "segmented_neutrophils", "neutrophils_percent"],
  lymphocytes: ["lymphocytes", "lymphocytes_percent"],
  monocytes: ["monocytes", "monocytes_percent"],
  eosinophils: ["eosinophils", "eosinophils_percent"],
  basophils: ["basophils", "basophils_percent"],
  absolute_neutrophils: ["absolute_neutrophils", "neutrophils_absolute", "anc"],
  absolute_lymphocytes: ["absolute_lymphocytes", "lymphocytes_absolute", "alc"],
  absolute_monocytes: ["absolute_monocytes", "monocytes_absolute"],
  absolute_eosinophils: ["absolute_eosinophils", "eosinophils_absolute"],
  absolute_basophils: ["absolute_basophils", "basophils_absolute"],
  platelet_count: ["platelet_count", "platelets"],
  mpv: ["mpv", "mean_platelet_volume"],
  hemoglobin: ["hemoglobin", "hb", "hgb"],
  total_cholesterol: ["total_cholesterol", "cholesterol_total", "cholesterol"],
  hdl_cholesterol: ["hdl_cholesterol", "hdl"],
  ldl_cholesterol: ["ldl_cholesterol", "ldl", "ldl_cholesterol_calculated"],
  vldl_cholesterol: ["vldl_cholesterol", "vldl", "vldl_cholesterol_calculated"],
  non_hdl_cholesterol: ["non_hdl_cholesterol", "non_hdl"],
  triglycerides: ["triglycerides", "tg"],
  fasting_glucose: ["fasting_glucose", "glucose_fasting", "fbs"],
  systolic_bp: ["systolic_bp", "systolic_blood_pressure", "bp_systolic"],
  diastolic_bp: ["diastolic_bp", "diastolic_blood_pressure", "bp_diastolic"],
};

// Build the reverse lookup once: synonym -> canonical name
const SYNONYM_TO_CANONICAL = {};
for (const [canonical, synonyms] of Object.entries(CANONICAL_TYPES)) {
  for (const synonym of synonyms) {
    SYNONYM_TO_CANONICAL[synonym] = canonical;
  }
}

/**
 * Maps a raw, already-lowercased/trimmed type string to its canonical form.
 * Unknown types pass through unchanged rather than being dropped — better
 * to store an unmapped type than silently lose a measurement. Unmapped
 * types show up in the console log below so they're easy to notice and
 * add to CANONICAL_TYPES later.
 */
function normalizeType(rawType) {
  const canonical = SYNONYM_TO_CANONICAL[rawType];
  if (!canonical) {
    console.log(`[extraction] no canonical mapping for type "${rawType}" — storing as-is`);
    return rawType;
  }
  return canonical;
}

module.exports = { normalizeType };