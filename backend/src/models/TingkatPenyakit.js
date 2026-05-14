const mongoose = require('mongoose');

const tingkatPenyakitSchema = new mongoose.Schema({
    kode_tingkat: { type: String, required: true, unique: true },
    nama_tingkat: { type: String, required: true },
    batas_min: { type: Number, required: true },
    batas_max: { type: Number, required: true },
    solusi_detox: { type: String, default: "" }

}, { timestamps: true });

module.exports = mongoose.model('TingkatPenyakit', tingkatPenyakitSchema);
