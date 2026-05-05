/**
 * Algoritma Inference Engine: Certainty Factor (CF)
 * 
 * Certainty Factor mengukur nilai kepastian (Confidence) pasien terhadap suatu kondisi, 
 * dikalikan dengan bobot pakar (Measure of Belief - Measure of Disbelief).
 */

/**
 * Menghitung Total Certainty Factor dari kumpulan input pengguna dan relasi nilainya di basis pengetahuan.
 * 
 * @param {Array<{gejalaId: string, cfUser: number}>} userInputs - Input kepastian dari form/user (0.0 sampai 1.0)
 * @param {Array<{gejala: string, cfPakar: number}>} knowledgeBase - Data pakar (MB - MD) dari database
 * @returns {number} Hasil akhir CF dalam bentuk desimal (misal 0.85 untuk 85%)
 */
function calculateCertaintyFactor(userInputs, knowledgeBase) {
  if (!userInputs || userInputs.length === 0) return 0;
  if (!knowledgeBase || knowledgeBase.length === 0) return 0;

  // 1. Dapatkan daftar CF [H,E] (Perkalian atribut User x Pakar untuk masing-masing gejala)
  const cfList = userInputs.map((input) => {
    // Cari data pakar untuk gejala bersangkutan
    const kbItem = knowledgeBase.find((kb) => kb.gejala === input.gejalaId || kb.kode_gejala === input.gejalaId);
    
    // Asumsikan pakar 0 jika data tidak ditemukan (fallback)
    const cfPakar = kbItem ? kbItem.cfPakar : 0;
    
    // Hitung Rule Evidence (Kekuatan Kombinasi Gejala Tunggal)
    const cfHE = input.cfUser * cfPakar;
    return cfHE;
  }).filter(cf => cf > 0); // Buang jika 0 agar tidak mengacaukan perhitungan

  if (cfList.length === 0) return 0;
  if (cfList.length === 1) return cfList[0];

  // 2. Kalkulasi Kombinasi Seluruh Gejala (CF Combine)
  // Rumus Combine: CF_Old + CF_New * (1 - CF_Old)
  let cfCombine = cfList[0];

  for (let i = 1; i < cfList.length; i++) {
    cfCombine = cfCombine + cfList[i] * (1 - cfCombine);
  }

  // Hindari kelebihan presisi (floating point error) seperti 0.8500000000001
  return Number(cfCombine.toFixed(4));
}

/**
 * Format CF menjadi format Persentase (%) untuk ditampilkan ke pengguna
 * 
 * @param {number} decimalValue - Nilai desimal CF (0.00 - 1.00)
 * @returns {string} String yang mudah dibaca, misalnya "85.20%"
 */
function formatCfToPercentage(decimalValue) {
  const percent = decimalValue * 100;
  return `${percent.toFixed(2)}%`;
}

/**
 * Memetakan hasil CF Akhir ke dalam klasifikasi/Tingkat Keparahan yang sesuai.
 * 
 * @param {number} totalCf - Total Kombinasi desimal CF
 * @param {Array} tingkatData - Data tingkat (mis. Nomophobia Ringan, Sedang, Berat)
 * @returns {Object} Data tingkat yang lolos threshold
 */
function determineSeverityLevel(totalCf, tingkatData) {
  if (!tingkatData || tingkatData.length === 0) return null;
  
  // Mencari tingkat di mana batas_min <= totalCf <= batas_max
  // Kita asumsikan batas_min dan batas_max dalam persentase atau desimal (kita konversi CF ke persentase jika perlu)
  // Misalkan totalCf itu desimal (0-1), batas di DB mungkin dalam persen (0-100) atau desimal.
  // Jika DB memakai persentase, kalikan totalCf dengan 100.
  const percentValue = totalCf * 100;
  
  const tingkat = tingkatData.find(t => percentValue >= t.batas_min && percentValue <= t.batas_max);
  
  if (tingkat) return tingkat;
  
  // Fallback
  return tingkatData[0];
}

module.exports = {
  calculateCertaintyFactor,
  formatCfToPercentage,
  determineSeverityLevel
};
