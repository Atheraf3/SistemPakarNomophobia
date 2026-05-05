const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middlewares/validateMiddleware');

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

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Email tidak valid')
];

const resetPasswordValidation = [
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

// Routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshToken);
router.post('/forgotpassword', validate(forgotPasswordValidation), authController.forgotPassword);
router.put('/resetpassword/:resetToken', validate(resetPasswordValidation), authController.resetPassword);

module.exports = router;
