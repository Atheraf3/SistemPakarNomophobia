const TingkatPenyakit = require('../models/TingkatPenyakit');

// GET all
exports.getAllTingkat = async (req, res) => {
    try {
        const tingkat = await TingkatPenyakit.find({}).sort({ batas_min: 1 });
        res.status(200).json({ data: tingkat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET single
exports.getTingkatById = async (req, res) => {
    try {
        const tingkat = await TingkatPenyakit.findById(req.params.id);
        if (!tingkat) return res.status(404).json({ message: "Tingkat tidak ditemukan" });
        res.status(200).json({ data: tingkat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// CREATE
exports.createTingkat = async (req, res) => {
    try {
        const { kode_tingkat, nama_tingkat, batas_min, batas_max } = req.body;
        
        // Cek duplikat kode
        const existing = await TingkatPenyakit.findOne({ kode_tingkat });
        if (existing) {
            return res.status(400).json({ message: "Kode tingkat sudah digunakan." });
        }

        const newTingkat = new TingkatPenyakit({
            kode_tingkat,
            nama_tingkat,
            batas_min,
            batas_max
        });

        await newTingkat.save();
        res.status(201).json({ message: "Berhasil menambahkan tingkat", data: newTingkat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// UPDATE
exports.updateTingkat = async (req, res) => {
    try {
        const { kode_tingkat, nama_tingkat, batas_min, batas_max } = req.body;
        
        // Cek duplikat kode (pastikan bukan dokumen ini sendiri)
        const existing = await TingkatPenyakit.findOne({ kode_tingkat, _id: { $ne: req.params.id } });
        if (existing) {
            return res.status(400).json({ message: "Kode tingkat sudah digunakan." });
        }

        const updated = await TingkatPenyakit.findByIdAndUpdate(
            req.params.id,
            { kode_tingkat, nama_tingkat, batas_min, batas_max },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Tingkat tidak ditemukan" });
        
        res.status(200).json({ message: "Berhasil memperbarui tingkat", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE
exports.deleteTingkat = async (req, res) => {
    try {
        const deleted = await TingkatPenyakit.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Tingkat tidak ditemukan" });
        
        res.status(200).json({ message: "Berhasil menghapus tingkat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
