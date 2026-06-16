const User = require('../models/User');
const TingkatPenyakit = require('../models/TingkatPenyakit');
const KnowledgeBase = require('../models/KnowledgeBase');
const Riwayat = require('../models/Riwayat');
const { calculateCertaintyFactor, determineSeverityLevel } = require('../utils/inferenceEngine');

exports.diagnose = async (req, res) => {
    try {
        const { userInputs } = req.body;
        
        const userId = req.user ? req.user._id : req.body.userId; 

        if (!userId) {
            return res.status(401).json({ message: "User ID tidak ditemukan. Harap login." });
        }

        if (!userInputs || !Array.isArray(userInputs)) {
            return res.status(400).json({ message: "Data userInputs tidak valid." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }
        
        if (user.role !== 'admin' && user.quota <= 0) {
            return res.status(403).json({ message: "Kuota diagnosis Anda telah habis." });
        }

        const kbData = await KnowledgeBase.find({ cf_pakar: { $ne: null } });

        if (!kbData || kbData.length === 0) {
            return res.status(500).json({ message: "Basis pengetahuan (CF Pakar) belum dikonfigurasi oleh admin." });
        }

        const symptoms = userInputs.map((input) => {
            const kbItem = kbData.find((kb) => kb.kode_gejala === input.gejalaId);
            return {
                symptomId: input.gejalaId,
                userCF: input.cfUser,
                expertCF: kbItem ? kbItem.cf_pakar : null,
            };
        });

        const cfResult = calculateCertaintyFactor(symptoms);

        const tingkatData = await TingkatPenyakit.find({}).sort({ batas_min: 1 });
        
        if (!tingkatData || tingkatData.length === 0) {
            return res.status(500).json({ message: "Data Tingkat Penyakit belum dikonfigurasi di sistem." });
        }

        const hasilTingkat = determineSeverityLevel(cfResult.percentage, tingkatData);

        const riwayat = new Riwayat({
            user_id: user._id,
            detail_jawaban_user: userInputs,
            nilai_cf_akhir: cfResult.finalCF,
            tingkat_keparahan: hasilTingkat ? hasilTingkat.nama_tingkat : cfResult.category
        });
        await riwayat.save();

        if (user.role !== 'admin') {
            user.quota -= 1;
            await user.save();
        }
        return res.status(200).json({
            message: "Diagnosis berhasil dilakukan.",
            data: {
                nilai_cf: cfResult.finalCF,
                persentase: cfResult.percentage.toFixed(2) + "%",
                tingkat_keparahan: hasilTingkat,
                sisa_kuota: user.role === 'admin' ? "Unlimited" : user.quota,
                riwayat_id: riwayat._id
            }
        });

    } catch (error) {
        console.error("Error pada proses diagnosis:", error);
        res.status(500).json({ message: "Terjadi kesalahan internal server." });
    }
};

// GET user history
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await Riwayat.find({ user_id: userId }).sort({ tanggal: -1 });
        res.status(200).json({ data: history });
    } catch (error) {
        console.error("Error mengambil riwayat:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat diagnosis." });
    }
};

// DELETE user history
exports.clearUserHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        await Riwayat.deleteMany({ user_id: userId });
        res.status(200).json({ message: "Riwayat berhasil dibersihkan." });
    } catch (error) {
        console.error("Error membersihkan riwayat:", error);
        res.status(500).json({ message: "Gagal membersihkan riwayat diagnosis." });
    }
};
