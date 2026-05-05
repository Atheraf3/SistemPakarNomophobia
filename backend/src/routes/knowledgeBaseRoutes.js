const express = require('express');
const router = express.Router();
const kbController = require('../controllers/knowledgeBaseController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// GET semua data KB
router.get('/', kbController.getAllKB);

// POST: sinkronisasi KB dengan daftar gejala (admin)
router.post('/sync', protect, authorizeRoles('admin'), kbController.syncKBWithGejala);

// PUT: update nilai MB dan MD suatu entry (admin)
router.put('/:id', protect, authorizeRoles('admin'), kbController.updateKB);

module.exports = router;
