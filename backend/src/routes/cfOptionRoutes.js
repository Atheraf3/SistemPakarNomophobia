const express = require('express');
const router = express.Router();
const cfOptionController = require('../controllers/cfOptionController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Public routes 
router.get('/', cfOptionController.getAllCfOptions);
router.get('/:id', cfOptionController.getCfOptionById);

// Admin only routes
router.use(protect);
router.use(authorizeRoles('admin'));

router.post('/', cfOptionController.createCfOption);
router.put('/:id', cfOptionController.updateCfOption);
router.delete('/:id', cfOptionController.deleteCfOption);

module.exports = router;
