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
export function calculateCertaintyFactor(userInputs, knowledgeBase) {
  if (!userInputs || userInputs.length === 0) return 0;
  if (!knowledgeBase || knowledgeBase.length === 0) return 0;

  // 1. Dapatkan daftar CF [H,E] (Perkalian atribut User x Pakar untuk masing-masing gejala)
  const cfList = userInputs.map((input) => {
    // Cari data pakar untuk gejala bersangkutan
    const kbItem = knowledgeBase.find((kb) => kb.gejala === input.gejalaId);
    
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
export function formatCfToPercentage(decimalValue) {
  const percent = decimalValue * 100;
  return `${percent.toFixed(2)}%`;
}

/**
 * Memetakan hasil CF Akhir ke dalam klasifikasi/Tingkat Keparahan yang sesuai.
 * Threshold ini biasanya bisa digenerate dinamis, tapi ini contoh implementasi yang umum di sistem pakar.
 * 
 * @param {number} totalCf - Total Kombinasi desimal CF
 * @param {Array} tingkatData - Data tingkat (mis. Nomophobia Ringan, Sedang, Berat)
 * @returns {Object} Data tingkat yang lolos threshold
 */
export function determineSeverityLevel(totalCf, tingkatData) {
  // Contoh Rule/Threshold Sederhana (bisa disesuaikan dengan logic skripsi aslinya)
  // CF < 0.4  => Ringan / Tidak Mengkhawatirkan
  // 0.4 <= CF < 0.7 => Sedang
  // CF >= 0.7 => Berat 

  if (totalCf >= 0.7 && tingkatData.length >= 3) {
    return tingkatData[2]; // Index untuk Nomophobia Berat
  } else if (totalCf >= 0.4 && tingkatData.length >= 2) {
    return tingkatData[1]; // Index untuk Nomophobia Sedang
  } else {
    return tingkatData[0]; // Index untuk Nomophobia Ringan / Normal
  }
}
