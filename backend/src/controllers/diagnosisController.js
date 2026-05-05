const User = require('../models/User');
const TingkatPenyakit = require('../models/TingkatPenyakit');
const KnowledgeBase = require('../models/KnowledgeBase');
const Riwayat = require('../models/Riwayat');
const { calculateCertaintyFactor, determineSeverityLevel } = require('../utils/inferenceEngine');

exports.diagnose = async (req, res) => {
    try {
        // Format userInputs yang diharapkan: [{ gejalaId: "G01", cfUser: 0.8 }, ...]
        const { userInputs } = req.body;
        
        const userId = req.user ? req.user._id : req.body.userId; 

        if (!userId) {
            return res.status(401).json({ message: "User ID tidak ditemukan. Harap login." });
        }

        if (!userInputs || !Array.isArray(userInputs)) {
            return res.status(400).json({ message: "Data userInputs tidak valid." });
        }

        // Cari user dan cek kuota
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }
        
        if (user.quota <= 0) {
            return res.status(403).json({ message: "Kuota diagnosis Anda telah habis." });
        }

        // 1. Ambil Knowledge Base dari database (hanya yang sudah diisi nilainya)
        const kbData = await KnowledgeBase.find({ cf_pakar: { $ne: null } });

        if (!kbData || kbData.length === 0) {
            return res.status(500).json({ message: "Basis pengetahuan (CF Pakar) belum dikonfigurasi oleh admin." });
        }

        // Format knowledge base agar sesuai dengan format inferenceEngine
        const knowledgeBase = kbData.map(kb => ({
            kode_gejala: kb.kode_gejala,
            cfPakar: kb.cf_pakar
        }));

        // 2. Hitung CF
        const totalCf = calculateCertaintyFactor(userInputs, knowledgeBase);

        // 3. Ambil referensi Tingkat Penyakit dari database
        const tingkatData = await TingkatPenyakit.find({}).sort({ batas_min: 1 });
        
        if (!tingkatData || tingkatData.length === 0) {
            return res.status(500).json({ message: "Data Tingkat Penyakit belum dikonfigurasi di sistem." });
        }

        // 3. Tentukan Tingkat Keparahan
        const hasilTingkat = determineSeverityLevel(totalCf, tingkatData);

        // 4. Simpan Riwayat
        const riwayat = new Riwayat({
            user_id: user._id,
            detail_jawaban_user: userInputs,
            nilai_cf_akhir: totalCf,
            tingkat_keparahan: hasilTingkat ? hasilTingkat.nama_tingkat : "Tidak Diketahui"
        });
        await riwayat.save();

        // 5. Potong kuota user - 1
        user.quota -= 1;
        await user.save();

        // 6. Kembalikan hasil akhir
        return res.status(200).json({
            message: "Diagnosis berhasil dilakukan.",
            data: {
                nilai_cf: totalCf,
                persentase: (totalCf * 100).toFixed(2) + "%",
                tingkat_keparahan: hasilTingkat,
                sisa_kuota: user.quota,
                riwayat_id: riwayat._id
            }
        });

    } catch (error) {
        console.error("Error pada proses diagnosis:", error);
        res.status(500).json({ message: "Terjadi kesalahan internal server." });
    }
};
