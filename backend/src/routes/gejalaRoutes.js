const express = require('express');
const router = express.Router();
const gejalaController = require('../controllers/gejalaController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', gejalaController.getAllGejala);
router.get('/:id', gejalaController.getGejalaById);

// Hanya admin yang bisa mengubah data
router.post('/', protect, authorizeRoles('admin'), gejalaController.createGejala);
router.put('/:id', protect, authorizeRoles('admin'), gejalaController.updateGejala);
router.delete('/:id', protect, authorizeRoles('admin'), gejalaController.deleteGejala);

module.exports = router;
