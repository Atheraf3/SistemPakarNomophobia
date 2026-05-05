const mongoose = require('mongoose');

const riwayatSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tanggal: { type: Date, default: Date.now },
    detail_jawaban_user: [{
        gejalaId: { type: String, required: true },
        cfUser: { type: Number, required: true }
    }],
    nilai_cf_akhir: { type: Number, required: true },
    tingkat_keparahan: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Riwayat', riwayatSchema);
