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
                role: user.role,
                age: user.age
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

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
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
                    quota: user.quota,
                    age: user.age,
                    shareData: user.shareData
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
            
            res.status(403);
            throw new Error('Forbidden: Invalid refresh token');
        }

        const jwt = require('jsonwebtoken'); 
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) {
                
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


// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin statistics
// @route   GET /api/auth/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDiagnosis = await Riwayat.countDocuments();
        
        res.status(200).json({
            data: {
                totalUsers,
                totalDiagnosis
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user's shareData preference
// @route   PATCH /api/auth/share-data
// @access  Private
const updateShareData = async (req, res, next) => {
    try {
        const { shareData } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { shareData },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: `Izin akses data berhasil ${shareData ? 'diaktifkan' : 'dinonaktifkan'}.`,
            data: { shareData: user.shareData }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get history of a specific user (Admin only)
// @route   GET /api/auth/users/:id/history
// @access  Private/Admin
const getUserHistoryByAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name email shareData');
        if (!user) {
            res.status(404);
            throw new Error('User tidak ditemukan');
        }
        if (!user.shareData) {
            res.status(403);
            throw new Error('User tidak mengizinkan akses data riwayat.');
        }
        const history = await Riwayat.find({ user_id: req.params.id }).sort({ tanggal: -1 });
        res.status(200).json({ data: history, user: { name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile (nama and umur)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, age } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User tidak ditemukan');
        }

        if (name) user.name = name;
        if (age) user.age = age;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                quota: user.quota,
                age: user.age,
                shareData: user.shareData
            }
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
    getAllUsers,
    getAdminStats,
    updateShareData,
    getUserHistoryByAdmin,
    updateProfile
};
