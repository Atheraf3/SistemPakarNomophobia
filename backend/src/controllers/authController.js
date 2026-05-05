const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken, generateResetToken } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, age } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error('Email sudah terdaftar');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            age,
            role: 'user',
            quota: 3
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400);
            throw new Error('Email atau password salah');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400);
            throw new Error('Email atau password salah');
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to DB
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Send refresh token in HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    quota: user.quota
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.status(204).json({ success: true, message: 'No content' });
        }
        
        const refreshToken = cookies.jwt;

        // Is refreshToken in DB?
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
            await user.save();
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
        
        res.status(200).json({
            success: true,
            message: 'Logout berhasil'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh token
// @route   GET /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.jwt) {
            res.status(401);
            throw new Error('Not authorized, no refresh token');
        }

        const refreshToken = cookies.jwt;
        const user = await User.findOne({ refreshTokens: refreshToken });

        if (!user) {
            // Detected token reuse!
            res.status(403);
            throw new Error('Forbidden: Invalid refresh token');
        }

        const jwt = require('jsonwebtoken'); // lazy require
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) {
                // remove token if invalid
                user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
                await user.save();
                res.status(403);
                return next(new Error('Forbidden: Token expired or invalid'));
            }

            const accessToken = generateAccessToken(user._id, user.role);
            res.status(200).json({
                success: true,
                message: 'Token refreshed',
                data: { accessToken }
            });
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(404);
            throw new Error('User tidak ditemukan');
        }

        const { resetToken, resetPasswordToken } = generateResetToken();

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        // Mock send email
        console.log(`[Mock Email] Silakan reset password menggunakan token ini: ${resetToken}`);
        console.log(`[Mock Email] URL Reset: http://localhost:5173/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'Email reset password telah dikirim (simulasi console log)'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400);
            throw new Error('Token tidak valid atau sudah kadaluarsa');
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        // Optionally invalidate all refresh tokens on password change
        user.refreshTokens = []; 
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password berhasil direset'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
};
