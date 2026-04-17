/**
 * Inference Engine sederhana untuk Sistem Pakar
 * Menggunakan metode Forward Chaining
 */

/**
 * Menjalankan forward chaining berdasarkan gejala yang dipilih
 * @param {string[]} selectedSymptoms - Array ID gejala yang dipilih
 * @param {Object[]} rules - Array rule dari knowledge base
 * @returns {Object[]} - Array hasil diagnosis yang cocok beserta confidence
 */
export function runForwardChaining(selectedSymptoms, rules) {
  const results = [];

  for (const rule of rules) {
    const matchedSymptoms = rule.conditions.filter((cond) =>
      selectedSymptoms.includes(cond)
    );
    const confidence = matchedSymptoms.length / rule.conditions.length;

    if (confidence > 0) {
      results.push({
        id: rule.id,
        name: rule.conclusion,
        description: rule.description || "",
        confidence: Math.round(confidence * 100),
        matchedSymptoms,
        totalSymptoms: rule.conditions.length,
      });
    }
  }

  // Urutkan dari confidence tertinggi
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Format persentase confidence untuk ditampilkan
 */
export function formatConfidence(value) {
  return `${value}%`;
}
