const express = require('express');
const router = express.Router();
const kbController = require('../controllers/knowledgeBaseController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/', kbController.getAllKB);

router.post('/sync', protect, authorizeRoles('admin'), kbController.syncKBWithGejala);

router.put('/:id', protect, authorizeRoles('admin'), kbController.updateKB);

module.exports = router;
