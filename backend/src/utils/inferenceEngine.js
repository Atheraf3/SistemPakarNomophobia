/**
 * =============================================================================
 * Inference Engine: Certainty Factor (CF)
 * Sistem Pakar Deteksi Dini Nomophobia
 * =============================================================================
 *
 * Metode: Certainty Factor (Shortliffe & Buchanan, 1975)
 *
 * Alur Perhitungan:
 *  1. CF per Gejala  : CF(H,E) = CF_user × CF_pakar
 *  2. CF Kombinasi   : CF_combine = CF_old + CF_new × (1 - CF_old)
 *  3. Konversi Skor  : percentage = finalCF × 100
 *  4. Klasifikasi    : tentukan tingkat keparahan dari database
 * =============================================================================
 */

/**
 * Menghitung Total Certainty Factor dari seluruh gejala yang dipilih pengguna.
 *
 * @param {Array<{symptomId: string, userCF: number, expertCF: number}>} symptoms
 *   Array gejala yang sudah digabungkan antara jawaban user dan bobot pakar:
 *   - symptomId : kode gejala (contoh: "G01")
 *   - userCF    : nilai kepastian user, rentang [0, 1]
 *                 (0 = Tidak Yakin, 0.2 = Agak Yakin, ..., 1.0 = Sangat Yakin)
 *   - expertCF  : bobot pakar (MB - MD), rentang [-1, 1], diambil dari MongoDB
 *
 * @returns {{ finalCF: number, percentage: number, category: string }}
 *   - finalCF    : nilai CF akhir hasil kombinasi, rentang [0, 1]
 *   - percentage : skor dalam persen, dibulatkan 2 desimal
 *   - category   : klasifikasi tingkat keparahan berdasarkan threshold statis
 */
function calculateCertaintyFactor(symptoms) {
  // ── Validasi Input ──────────────────────────────────────────────────────────
  if (!symptoms || symptoms.length === 0) {
    return { finalCF: 0, percentage: 0, category: classifyByPercentage(0) };
  }

  // ── Langkah 1: Hitung CF(H,E) untuk setiap gejala ──────────────────────────
  // Rumus: CF(H,E) = CF_user × CF_pakar
  // - CF_user   = tingkat keyakinan pengguna terhadap gejala tersebut
  // - CF_pakar  = bobot kepastian pakar (hasil MB - MD dari Basis Pengetahuan)
  // - CF(H,E)   = kekuatan bukti gejala tunggal terhadap hipotesis Nomophobia
  const cfPerSymptom = symptoms
    .filter((s) => s.userCF > 0 && s.expertCF !== null && s.expertCF !== undefined)
    .map((s) => {
      const cfHE = s.userCF * s.expertCF;
      return cfHE;
    })
    .filter((cf) => cf > 0); // Hanya CF positif yang berkontribusi pada diagnosis

  if (cfPerSymptom.length === 0) {
    return { finalCF: 0, percentage: 0, category: classifyByPercentage(0) };
  }

  // ── Langkah 2: Kombinasi Seluruh CF (Similarly Concluded Rules) ─────────────
  // Jika hanya ada satu gejala, tidak perlu kombinasi
  if (cfPerSymptom.length === 1) {
    const finalCF = parseFloat(cfPerSymptom[0].toFixed(4));
    const percentage = parseFloat((finalCF * 100).toFixed(2));
    return { finalCF, percentage, category: classifyByPercentage(percentage) };
  }

  // Kombinasi iteratif menggunakan rumus Similarly Concluded Rules:
  // CF_combine = CF_old + CF_new × (1 - CF_old)
  //
  // Penjelasan rumus:
  // - CF_old  : nilai CF yang sudah terakumulasi dari gejala sebelumnya
  // - CF_new  : nilai CF(H,E) dari gejala berikutnya
  // - Hasilnya selalu meningkat namun tidak pernah melebihi 1 (bounded)
  let cfCombined = cfPerSymptom[0]; // Inisialisasi dengan gejala pertama

  for (let i = 1; i < cfPerSymptom.length; i++) {
    const cfOld = cfCombined;
    const cfNew = cfPerSymptom[i];

    // Rumus kombinasi Certainty Factor
    cfCombined = cfOld + cfNew * (1 - cfOld);
  }

  // Clamp ke [0, 1] untuk mencegah floating-point drift
  cfCombined = Math.max(0, Math.min(1, cfCombined));

  // ── Langkah 3: Konversi ke Persentase ──────────────────────────────────────
  // Skor akhir dikalikan 100 dan dibulatkan 2 angka desimal
  const finalCF = parseFloat(cfCombined.toFixed(4));
  const percentage = parseFloat((finalCF * 100).toFixed(2));

  // ── Langkah 4: Klasifikasi Tingkat Keparahan ────────────────────────────────
  const category = classifyByPercentage(percentage);

  return { finalCF, percentage, category };
}

/**
 * Mengklasifikasikan tingkat keparahan Nomophobia berdasarkan skor persentase CF.
 *
 * Threshold ini digunakan sebagai FALLBACK statis jika data TingkatPenyakit
 * dari database tidak tersedia. Nilai utama tetap diambil dari MongoDB
 * melalui fungsi determineSeverityLevel().
 *
 * Referensi threshold (dapat dimodifikasi):
 *   0%  – 20% : Tidak Nomophobia
 *   21% – 40% : Nomophobia Ringan
 *   41% – 60% : Nomophobia Sedang
 *   61% – 80% : Nomophobia Berat
 *   81% – 100%: Nomophobia Akut
 *
 * @param {number} percentage - Skor CF dalam persentase (0–100)
 * @returns {string} Kategori tingkat keparahan
 */
function classifyByPercentage(percentage) {
  // Threshold didefinisikan eksplisit agar mudah dimodifikasi saat sidang skripsi
  const THRESHOLDS = [
    { min: 0,  max: 20,  label: "Tidak Nomophobia"  },
    { min: 21, max: 40,  label: "Nomophobia Ringan"  },
    { min: 41, max: 60,  label: "Nomophobia Sedang"  },
    { min: 61, max: 80,  label: "Nomophobia Berat"   },
    { min: 81, max: 100, label: "Nomophobia Akut"    },
  ];

  const match = THRESHOLDS.find((t) => percentage >= t.min && percentage <= t.max);
  return match ? match.label : "Tidak Diketahui";
}

/**
 * Memetakan nilai CF akhir ke tingkat keparahan Nomophobia dari database.
 *
 * Fungsi ini menggunakan data TingkatPenyakit dari MongoDB sebagai sumber
 * kebenaran utama (dynamic thresholds), sehingga admin dapat mengubah
 * rentang batas tanpa perlu mengubah kode.
 *
 * Asumsi: batas_min & batas_max di database dalam format PERSENTASE (0–100).
 *
 * Contoh data TingkatPenyakit di DB:
 *   { nama_tingkat: "Tidak Nomophobia",  batas_min: 0,  batas_max: 20  }
 *   { nama_tingkat: "Nomophobia Ringan", batas_min: 21, batas_max: 40  }
 *   { nama_tingkat: "Nomophobia Sedang", batas_min: 41, batas_max: 60  }
 *   { nama_tingkat: "Nomophobia Berat",  batas_min: 61, batas_max: 80  }
 *   { nama_tingkat: "Nomophobia Akut",   batas_min: 81, batas_max: 100 }
 *
 * @param {number} percentage  - Skor persentase CF (0–100), dari calculateCertaintyFactor().percentage
 * @param {Array}  tingkatData - Array dokumen TingkatPenyakit dari MongoDB
 * @returns {Object|null}      - Dokumen tingkat yang cocok, atau null
 */
function determineSeverityLevel(percentage, tingkatData) {
  if (!tingkatData || tingkatData.length === 0) return null;

  // Pastikan nilai tidak negatif
  const safePercentage = Math.max(0, percentage);

  // Cari tingkat yang rentangnya mencakup persentase CF pengguna
  const tingkat = tingkatData.find(
    (t) => safePercentage >= t.batas_min && safePercentage <= t.batas_max
  );

  if (tingkat) return tingkat;

  // Fallback: kembalikan tingkat dengan batas_max tertinggi
  // (menangani edge case CF tepat = 100% dan batas_max < 100)
  const sorted = [...tingkatData].sort((a, b) => b.batas_max - a.batas_max);
  return sorted[0];
}

module.exports = {
  calculateCertaintyFactor,
  classifyByPercentage,
  determineSeverityLevel,
};