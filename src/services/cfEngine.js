/**
 * Certainty Factor (CF) Inference Engine
 * Sistem Pakar Nomophobia
 *
 * Formula kombinasi CF:
 *   CF_combined = CF1 + CF2 * (1 - CF1)  => jika kedua CF positif
 *   CF_combined = CF1 + CF2 * (1 + CF1)  => jika kedua CF negatif
 *   CF_combined = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))  => jika berlawanan tanda
 *
 * CF(H,E) = CF(H|E_pakar) * max(0, CF_user)
 */

import { rules } from "./knowledgeBase";

/**
 * Menggabungkan dua nilai CF
 * @param {number} cf1
 * @param {number} cf2
 * @returns {number}
 */
function combineCF(cf1, cf2) {
  if (cf1 >= 0 && cf2 >= 0) {
    return cf1 + cf2 * (1 - cf1);
  } else if (cf1 < 0 && cf2 < 0) {
    return cf1 + cf2 * (1 + cf1);
  } else {
    return (cf1 + cf2) / (1 - Math.min(Math.abs(cf1), Math.abs(cf2)));
  }
}

/**
 * Menjalankan inferensi Certainty Factor
 * @param {Object} answers - { [symptomId]: cfUserValue }
 * @returns {Array} Sorted results dengan CF score per penyakit
 */
export function runCFInference(answers) {
  const results = rules.map((rule) => {
    let combinedCF = null;

    // Hitung CF untuk setiap gejala yang relevan dengan rule ini
    Object.entries(rule.conditions).forEach(([symptomId, cfPakar]) => {
      const cfUser = answers[symptomId] ?? 0; // Default 0 jika tidak dijawab

      // Hanya hitung jika user memberikan nilai positif (mengalami gejala)
      if (cfUser > 0) {
        const cfHE = cfPakar * cfUser; // CF(H,E) = CF_pakar * CF_user

        if (combinedCF === null) {
          combinedCF = cfHE;
        } else {
          combinedCF = combineCF(combinedCF, cfHE);
        }
      }
    });

    const finalCF = combinedCF ?? 0;
    const percentage = Math.max(0, Math.min(100, Math.round(finalCF * 100)));

    return {
      ...rule,
      cfScore: finalCF,
      percentage,
    };
  });

  // Urutkan berdasarkan CF score tertinggi
  return results.sort((a, b) => b.cfScore - a.cfScore);
}

/**
 * Mendapatkan hasil diagnosis utama (CF tertinggi)
 * @param {Object} answers
 * @returns {Object} Primary diagnosis result
 */
export function getPrimaryDiagnosis(answers) {
  const results = runCFInference(answers);
  return results[0] ?? null;
}

/**
 * Menginterpretasikan level keparahan berdasarkan persentase CF
 * @param {number} percentage
 * @returns {Object} { label, color, description }
 */
export function interpretCFLevel(percentage) {
  if (percentage >= 70) {
    return {
      label: "Tinggi",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeColor: "bg-red-100 text-red-700",
      barColor: "bg-red-500",
    };
  } else if (percentage >= 40) {
    return {
      label: "Sedang",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      badgeColor: "bg-amber-100 text-amber-700",
      barColor: "bg-amber-500",
    };
  } else if (percentage > 0) {
    return {
      label: "Rendah",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badgeColor: "bg-green-100 text-green-700",
      barColor: "bg-green-500",
    };
  } else {
    return {
      label: "Normal",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      badgeColor: "bg-slate-100 text-slate-700",
      barColor: "bg-slate-400",
    };
  }
}
