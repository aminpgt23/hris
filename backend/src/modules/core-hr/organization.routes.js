const express = require('express');
const router = express.Router();
const ctrl = require('./organization.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/chart', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getChart);
router.get('/stats', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getStats);

module.exports = router;
