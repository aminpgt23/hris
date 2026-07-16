const express = require('express');
const router = express.Router();
const ctrl = require('./schedule.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/', authorize('Administrator', 'HR Staff'), ctrl.getAll);
router.post('/bulk-assign', authorize('Administrator', 'HR Staff'), ctrl.bulkAssign);

module.exports = router;
