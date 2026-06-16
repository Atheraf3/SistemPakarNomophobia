const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middlewares/validateMiddleware');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Validation schemas
const registerValidation = [
    body('name').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi')
];


// Routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshToken);

router.get('/users', protect, authorizeRoles('admin'), authController.getAllUsers);
router.get('/admin/stats', protect, authorizeRoles('admin'), authController.getAdminStats);
router.get('/users/:id/history', protect, authorizeRoles('admin'), authController.getUserHistoryByAdmin);
router.put('/users/:id/reset-quota', protect, authorizeRoles('admin'), authController.resetUserQuota);

router.patch('/share-data', protect, authController.updateShareData);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
