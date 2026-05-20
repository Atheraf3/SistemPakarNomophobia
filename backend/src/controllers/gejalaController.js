const Gejala = require('../models/Gejala');

// GET all
exports.getAllGejala = async (req, res) => {
    try {
        const gejala = await Gejala.find({}).sort({ kode_gejala: 1 });
        res.status(200).json({ data: gejala });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET single
exports.getGejalaById = async (req, res) => {
    try {
        const gejala = await Gejala.findById(req.params.id);
        if (!gejala) return res.status(404).json({ message: "Gejala tidak ditemukan" });
        res.status(200).json({ data: gejala });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// CREATE
exports.createGejala = async (req, res) => {
    try {
        const { kode_gejala, pernyataan } = req.body;

        const existing = await Gejala.findOne({ kode_gejala });
        if (existing) {
            return res.status(400).json({ message: "ID Gejala sudah digunakan." });
        }

        const newGejala = new Gejala({ kode_gejala, pernyataan });
        await newGejala.save();
        res.status(201).json({ message: "Berhasil menambahkan gejala", data: newGejala });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// UPDATE
exports.updateGejala = async (req, res) => {
    try {
        const { kode_gejala, pernyataan, isActive } = req.body;

        const existing = await Gejala.findOne({ kode_gejala, _id: { $ne: req.params.id } });
        if (existing) {
            return res.status(400).json({ message: "ID Gejala sudah digunakan." });
        }

        const updateData = { kode_gejala, pernyataan };
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        const updated = await Gejala.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Gejala tidak ditemukan" });
        res.status(200).json({ message: "Berhasil memperbarui gejala", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE
exports.deleteGejala = async (req, res) => {
    try {
        const deleted = await Gejala.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Gejala tidak ditemukan" });
        res.status(200).json({ message: "Berhasil menghapus gejala" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
