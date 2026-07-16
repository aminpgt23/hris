const express = require('express');
const router = express.Router();
const ctrl = require('./overtime.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.post('/', authorize('Employee', 'Administrator'), ctrl.request);
router.get('/', authorize('Administrator', 'HR Staff', 'Manager', 'Employee'), ctrl.getAll);
router.put('/:id/approve', authorize('Manager', 'Administrator', 'HR Staff'), ctrl.approve);
router.put('/:id/reject', authorize('Manager', 'Administrator', 'HR Staff'), ctrl.reject);

module.exports = router;
