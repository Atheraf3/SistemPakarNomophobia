const KnowledgeBase = require('../models/KnowledgeBase');
const Gejala = require('../models/Gejala');

// GET all knowledge base entries
exports.getAllKB = async (req, res) => {
    try {
        const kb = await KnowledgeBase.aggregate([
            {
                $lookup: {
                    from: "gejalas",
                    localField: "kode_gejala",
                    foreignField: "kode_gejala",
                    as: "gejala_info"
                }
            },
            {
                $unwind: { path: "$gejala_info", preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: { isActive: { $ifNull: ["$gejala_info.isActive", true] } }
            },
            {
                $project: { gejala_info: 0 }
            },
            {
                $sort: { kode_gejala: 1 }
            }
        ]);
        res.status(200).json({ data: kb });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.syncKBWithGejala = async (req, res) => {
    try {
        const allGejala = await Gejala.find({}).sort({ kode_gejala: 1 });
        const existingKB = await KnowledgeBase.find({});
        const existingCodes = new Set(existingKB.map(k => k.kode_gejala));

        const toInsert = allGejala
            .filter(g => !existingCodes.has(g.kode_gejala))
            .map(g => ({ kode_gejala: g.kode_gejala, mb: null, md: null, cf_pakar: null }));

        if (toInsert.length > 0) {
            await KnowledgeBase.insertMany(toInsert);
        }

        const updatedKB = await KnowledgeBase.find({}).sort({ kode_gejala: 1 });
        res.status(200).json({ data: updatedKB, synced: toInsert.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// UPDATE nilai MB dan MD
exports.updateKB = async (req, res) => {
    try {
        const { mb, md } = req.body;

        const mbVal = parseFloat(mb);
        const mdVal = parseFloat(md);

        if (isNaN(mbVal) || isNaN(mdVal)) {
            return res.status(400).json({ message: "Nilai MB dan MD harus berupa angka." });
        }
        if (mbVal < 0 || mbVal > 1 || mdVal < 0 || mdVal > 1) {
            return res.status(400).json({ message: "Nilai MB dan MD harus antara 0.0 dan 1.0." });
        }

        const cf_pakar = parseFloat((mbVal - mdVal).toFixed(4));

        const updated = await KnowledgeBase.findByIdAndUpdate(
            req.params.id,
            { $set: { mb: mbVal, md: mdVal, cf_pakar } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Data tidak ditemukan" });

        res.status(200).json({ message: "Berhasil memperbarui bobot", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
