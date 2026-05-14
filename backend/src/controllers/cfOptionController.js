const CfOption = require('../models/CfOption');

// GET all
exports.getAllCfOptions = async (req, res) => {
    try {
        const cfOptions = await CfOption.find({}).sort({ value: -1 });
        res.status(200).json({ data: cfOptions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET single
exports.getCfOptionById = async (req, res) => {
    try {
        const cfOption = await CfOption.findById(req.params.id);
        if (!cfOption) return res.status(404).json({ message: "CF Option tidak ditemukan" });
        res.status(200).json({ data: cfOption });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// CREATE
exports.createCfOption = async (req, res) => {
    try {
        const { label, value, description } = req.body;
        
        const newCfOption = new CfOption({
            label,
            value,
            description
        });

        await newCfOption.save();
        res.status(201).json({ message: "Berhasil menambahkan CF Option", data: newCfOption });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// UPDATE
exports.updateCfOption = async (req, res) => {
    try {
        const { label, value, description } = req.body;
        
        const updated = await CfOption.findByIdAndUpdate(
            req.params.id,
            { label, value, description },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "CF Option tidak ditemukan" });
        
        res.status(200).json({ message: "Berhasil memperbarui CF Option", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE
exports.deleteCfOption = async (req, res) => {
    try {
        const deleted = await CfOption.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "CF Option tidak ditemukan" });
        
        res.status(200).json({ message: "Berhasil menghapus CF Option" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
