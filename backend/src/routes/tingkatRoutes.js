const express = require('express');
const router = express.Router();
const tingkatController = require('../controllers/tingkatController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', tingkatController.getAllTingkat);
router.get('/:id', tingkatController.getTingkatById);

// Hanya admin yang bisa mengubah data
router.post('/', protect, authorizeRoles('admin'), tingkatController.createTingkat);
router.put('/:id', protect, authorizeRoles('admin'), tingkatController.updateTingkat);
router.delete('/:id', protect, authorizeRoles('admin'), tingkatController.deleteTingkat);

module.exports = router;
