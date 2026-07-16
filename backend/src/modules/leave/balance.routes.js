const express = require('express');
const router = express.Router();
const ctrl = require('./balance.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/', authorize('Administrator', 'HR Staff'), ctrl.getAll);
router.post('/adjust', authorize('Administrator', 'HR Staff'), ctrl.adjust);

module.exports = router;
