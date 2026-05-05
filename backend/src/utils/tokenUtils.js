const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate Access Token (short-lived, e.g., 15m)
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    );
};

// Generate Refresh Token (long-lived, e.g., 7d)
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

// Generate a random token for password reset
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        
    return { resetToken, resetPasswordToken };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateResetToken
};
