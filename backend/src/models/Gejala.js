const mongoose = require('mongoose');

const gejalaSchema = new mongoose.Schema({
    kode_gejala: { type: String, required: true, unique: true },
    pernyataan: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Gejala', gejalaSchema);
