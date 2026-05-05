const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { protect } = require('../middlewares/authMiddleware');

// Route untuk memproses diagnosis user
// Membutuhkan user yang sudah login (punya token valid)
router.post('/', protect, diagnosisController.diagnose);

module.exports = router;
