/**
 * Knowledge Base Sistem Pakar Nomophobia
 * Menggunakan metode Certainty Factor (CF)
 */

// Daftar gejala/pertanyaan
export const symptoms = [
  { id: "G01", text: "Saya merasa tidak nyaman tanpa akses konstan ke informasi di smartphone saya." },
  { id: "G02", text: "Saya merasa terganggu jika tidak bisa mencari informasi di smartphone ketika saya ingin." },
  { id: "G03", text: "Saya akan merasa cemas jika tidak bisa mendapatkan berita terkini di smartphone saya." },
  { id: "G04", text: "Saya merasa gelisah ketika baterai smartphone saya hampir habis." },
  { id: "G05", text: "Saya panik jika tidak dapat menemukan smartphone saya." },
  { id: "G06", text: "Saya merasa takut jika tidak bisa menggunakan smartphone saya kapan pun saya inginkan." },
  { id: "G07", text: "Saya terus memikirkan smartphone saya bahkan saat sedang melakukan aktivitas lain." },
  { id: "G08", text: "Saya merasa sulit berkonsentrasi pada suatu tugas jika smartphone saya tidak ada di dekat saya." },
  { id: "G09", text: "Saya merasa tidak aman tanpa smartphone saya." },
  { id: "G10", text: "Saya merasa kesulitan memisahkan diri dari smartphone, bahkan untuk waktu singkat." },
  { id: "G11", text: "Saya kerap memeriksa smartphone saya secara berulang tanpa alasan yang jelas (phantom vibration)." },
  { id: "G12", text: "Saya menggunakan smartphone untuk menghindari perasaan cemas atau tidak nyaman." },
  { id: "G13", text: "Jika tidak ada sinyal atau Wi-Fi, saya merasa terputus dari dunia." },
  { id: "G14", text: "Saya kesulitan untuk mematikan smartphone atau meninggalkannya bahkan saat tidur." },
  { id: "G15", text: "Saya merasa hubungan sosial saya terganggu karena penggunaan smartphone yang berlebihan." },
];

/**
 * Nilai CF (Certainty Factor) pakar untuk setiap gejala per penyakit.
 * Format: { [symptomId]: cfPakar }
 */
export const rules = [
  {
    id: "P01",
    name: "Nomophobia Ringan",
    description:
      "Individu mengalami sedikit ketergantungan pada smartphone. Rasa cemas mulai muncul saat terpisah dari ponsel, namun masih dapat dikendalikan. Kondisi ini umumnya tidak mengganggu aktivitas sehari-hari secara signifikan.",
    mainCause:
      "Kebiasaan memeriksa ponsel yang mulai meningkat, ketidaknyamanan ringan saat tidak ada sinyal atau baterai habis, serta ketergantungan awal pada informasi digital.",
    solution: {
      title: "Detoks Digital Ringan",
      steps: [
        "Terapkan aturan 'ponsel bebas' selama 1-2 jam sehari, misalnya saat makan atau sebelum tidur.",
        "Aktifkan fitur 'Screen Time' atau 'Digital Wellbeing' di ponsel untuk memantau penggunaan.",
        "Mulailah dengan hobi offline yang menyenangkan seperti membaca buku fisik atau olahraga ringan.",
        "Matikan notifikasi yang tidak penting agar tidak terus terdorong untuk memeriksa ponsel.",
        "Bangun kebiasaan mindfulness sederhana seperti meditasi 5-10 menit setiap pagi.",
      ],
    },
    conditions: { G01: 0.4, G02: 0.4, G03: 0.3, G04: 0.3, G05: 0.2 },
  },
  {
    id: "P02",
    name: "Nomophobia Sedang",
    description:
      "Individu menunjukkan ketergantungan yang cukup signifikan terhadap smartphone. Kecemasan muncul lebih kuat dan lebih sering, konsentrasi mulai terganggu, dan muncul perilaku kompulsif memeriksa ponsel secara berulang.",
    mainCause:
      "Kecemasan yang meningkat saat tidak ada ponsel, kebiasaan memeriksa ponsel secara kompulsif (phantom vibration), penggunaan ponsel sebagai pelarian dari tekanan emosional, serta kesulitan melepaskan diri dari ponsel bahkan dalam waktu singkat.",
    solution: {
      title: "Program Pemulihan Terstruktur",
      steps: [
        "Lakukan 'Digital Detox' selama 3-4 jam setiap harinya dan catat perasaan yang muncul.",
        "Gunakan teknik 'Phone Stacking' saat berkumpul bersama orang lain: taruh ponsel menghadap bawah di tengah meja.",
        "Identifikasi pemicu emosional yang membuat Anda menggunakan ponsel (bosan, cemas, kesepian) dan cari pengganti yang sehat.",
        "Coba tantangan 'No Phone Morning': jangan sentuh ponsel selama 1 jam setelah bangun tidur.",
        "Bergabunglah dengan komunitas atau kelas tatap muka untuk memperkuat interaksi sosial nyata.",
        "Pertimbangkan untuk berkonsultasi dengan konselor atau psikolog jika gejala terasa menyulitkan.",
      ],
    },
    conditions: { G04: 0.6, G05: 0.6, G06: 0.5, G07: 0.5, G08: 0.5, G09: 0.4, G11: 0.4 },
  },
  {
    id: "P03",
    name: "Nomophobia Berat",
    description:
      "Individu mengalami ketergantungan parah terhadap smartphone yang secara nyata mengganggu fungsi sosial, pekerjaan, dan kesehatan mental. Kecemasan yang dirasakan sangat intens, dan individu tidak mampu mengendalikan dorongan untuk menggunakan ponsel.",
    mainCause:
      "Ketergantungan akut pada smartphone sebagai mekanisme koping utama untuk mengatasi kecemasan, rasa tidak aman yang mendalam tanpa perangkat, gangguan berat pada konsentrasi dan produktivitas, serta isolasi sosial karena preferensi interaksi digital dibandingkan tatap muka.",
    solution: {
      title: "Intervensi Intensif & Pemulihan Mendalam",
      steps: [
        "Segera cari bantuan profesional: psikolog atau psikiater dapat membantu menangani kecemasan yang mendasari dengan terapi kognitif-perilaku (CBT).",
        "Buat 'Kontrak Digital' dengan seseorang yang dipercaya: atur batas waktu penggunaan ponsel yang disepakati bersama.",
        "Pertimbangkan program 'Digital Sabbatical' selama akhir pekan: matikan smartphone sepenuhnya selama 24-48 jam secara berkala.",
        "Restrukturisasi rutinitas harian: jauhkan ponsel dari kamar tidur, gunakan jam alarm fisik.",
        "Bangun kembali koneksi sosial nyata secara perlahan dan konsisten melalui pertemuan tatap muka.",
        "Catat jurnal harian tentang perasaan dan dorongan menggunakan ponsel untuk membangun kesadaran diri.",
        "Pertimbangkan penggunaan aplikasi pemblokir (blocker) untuk media sosial selama jam-jam tertentu.",
      ],
    },
    conditions: { G06: 0.7, G07: 0.7, G08: 0.6, G09: 0.7, G10: 0.8, G11: 0.6, G12: 0.7, G13: 0.5, G14: 0.8, G15: 0.6 },
  },
];

/**
 * Opsi jawaban dengan nilai CF User (MB - MD)
 */
export const cfOptions = [
  { label: "Sangat Yakin", value: 1.0, description: "Saya sangat mengalami ini" },
  { label: "Yakin", value: 0.8, description: "Saya sering mengalami ini" },
  { label: "Cukup Yakin", value: 0.6, description: "Saya kadang mengalami ini" },
  { label: "Kurang Yakin", value: 0.4, description: "Saya jarang mengalami ini" },
  { label: "Tidak Tahu", value: 0.2, description: "Saya tidak yakin" },
  { label: "Tidak", value: 0.0, description: "Saya tidak mengalami ini" },
];
