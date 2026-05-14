const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Public route for frontend
router.get('/', configController.getSystemConfig);


module.exports = router;
