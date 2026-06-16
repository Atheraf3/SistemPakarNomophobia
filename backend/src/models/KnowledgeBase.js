const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    kode_gejala: { type: String, required: true, unique: true, ref: 'Gejala' },
    mb: { type: Number, min: 0, max: 1, default: null },
    md: { type: Number, min: 0, max: 1, default: null },
    cf_pakar: { type: Number, default: null }
}, { timestamps: true });

knowledgeBaseSchema.pre('save', function (next) {
    if (this.mb !== null && this.mb !== undefined && this.md !== null && this.md !== undefined) {
        this.cf_pakar = parseFloat((this.mb - this.md).toFixed(4));
    } else {
        this.cf_pakar = null;
    }
    next();
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

