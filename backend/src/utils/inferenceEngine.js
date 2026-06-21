/**
 * Hitung Total Certainty Factor.
 */
function calculateCertaintyFactor(symptoms) {
  if (!symptoms || symptoms.length === 0) {
    return { finalCF: 0, percentage: 0, category: "Tidak Diketahui" };
  }

  // Hitung CF
  const processedSymptoms = symptoms
    .map((s) => ({
      id: String(s.symptomId || s.kode || s.kode_gejala || s.id || '').toUpperCase(),
      cfHE: Math.max(0, parseFloat(s.userCF) || 0) * Math.max(0, parseFloat(s.expertCF) || 0)
    }))
    .filter((s) => s.cfHE > 0);

  // Dimensi gejala
  const dimensions = [
    ["G01", "G02", "G03", "G04"],
    ["G05", "G06", "G07", "G08", "G09"],
    ["G10", "G11", "G12", "G13", "G14", "G15"],
    ["G16", "G17", "G18", "G19", "G20"]
  ];

  // Fungsi combine CF
  const combineCF = (cfArray) => {
    if (cfArray.length === 0) return 0;
    return cfArray.reduce((cfOld, cfNew) => cfOld + cfNew * (1 - cfOld), 0);
  };

  // CF per dimensi
  const cfDimensions = dimensions.map((range) => {
    const cfList = processedSymptoms
      .filter((s) => range.includes(s.id))
      .map((s) => s.cfHE);
    return combineCF(cfList);
  });

  // Rata-rata akhir
  const finalCF = cfDimensions.reduce((sum, val) => sum + val, 0) / dimensions.length;

  // Konversi persentase
  const percentage = parseFloat((finalCF * 100).toFixed(2));

  return { 
    finalCF: parseFloat(finalCF.toFixed(4)), 
    percentage, 
    category: "Tidak Diketahui" 
  };
}

/**
 * Petakan CF ke tingkat keparahan.
 */
function determineSeverityLevel(percentage, tingkatData) {
  if (!tingkatData || tingkatData.length === 0) return null;

  // Bulatkan persentase
  const safePercentage = Math.round(Math.max(0, percentage));

  const tingkat = tingkatData.find(
    (t) => safePercentage >= t.batas_min && safePercentage <= t.batas_max
  );

  return tingkat || null;
}

module.exports = {
  calculateCertaintyFactor,
  determineSeverityLevel
};