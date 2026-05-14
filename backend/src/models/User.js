const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    quota: { type: Number, default: 3 },
    shareData: { type: Boolean, default: false },
    refreshTokens: [String],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
