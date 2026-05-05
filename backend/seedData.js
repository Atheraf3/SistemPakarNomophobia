const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TingkatPenyakit = require('./src/models/TingkatPenyakit');

// Fix DNS for MongoDB Atlas
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const seedTingkatPenyakit = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skripsi_db';
    await mongoose.connect(mongoUri, { family: 4 });

    const tingkatData = [
      {
        nama_tingkat: "Normal / Rendah",
        batas_min: 0,
        batas_max: 0.39,
        solusi_detox: "Anda memiliki tingkat ketergantungan yang rendah pada smartphone. Pertahankan kebiasaan baik Anda dan terus nikmati aktivitas di dunia nyata."
      },
      {
        nama_tingkat: "Sedang",
        batas_min: 0.40,
        batas_max: 0.69,
        solusi_detox: "Anda mulai menunjukkan gejala nomophobia tingkat sedang. Cobalah untuk membatasi penggunaan smartphone di malam hari, hindari membawa smartphone ke tempat tidur, dan perbanyak interaksi sosial secara langsung."
      },
      {
        nama_tingkat: "Tinggi",
        batas_min: 0.70,
        batas_max: 1.0,
        solusi_detox: "Tingkat ketergantungan Anda tinggi. Disarankan untuk segera melakukan detoks digital (seperti menjadwalkan hari tanpa layar), menetapkan batas waktu penggunaan aplikasi, dan sangat dianjurkan untuk berkonsultasi dengan profesional atau psikolog untuk penanganan lebih lanjut."
      }
    ];

    await TingkatPenyakit.deleteMany({});
    await TingkatPenyakit.insertMany(tingkatData);
    
    console.log("Data Tingkat Penyakit berhasil di-seed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedTingkatPenyakit();
