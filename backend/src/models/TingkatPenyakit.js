const mongoose = require('mongoose');

const tingkatPenyakitSchema = new mongoose.Schema({
    kode_tingkat: { type: String, required: true, unique: true },
    nama_tingkat: { type: String, required: true },
    batas_min: { type: Number, required: true },
    batas_max: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TingkatPenyakit', tingkatPenyakitSchema);
