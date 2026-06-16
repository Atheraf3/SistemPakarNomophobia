const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, diagnosisController.diagnose);
router.get('/history', protect, diagnosisController.getUserHistory);
router.delete('/history', protect, diagnosisController.clearUserHistory);

module.exports = router;