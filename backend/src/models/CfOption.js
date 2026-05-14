const mongoose = require('mongoose');

const cfOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CfOption', cfOptionSchema);
