const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Public route
router.get('/', configController.getSystemConfig);

module.exports = router;