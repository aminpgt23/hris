const express = require('express');
const router = express.Router();
const ctrl = require('./leave.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);

router.post('/requests', authorize('Employee', 'Administrator', 'HR Staff'), ctrl.createRequest);
router.get('/requests', authorize('Administrator', 'HR Staff', 'Manager', 'Employee'), ctrl.getAll);
router.put('/requests/:id/approve-manager', authorize('Manager', 'Administrator'), ctrl.approveManager);
router.put('/requests/:id/approve-hr', authorize('HR Staff', 'Administrator'), ctrl.approveHR);
router.put('/requests/:id/reject', authorize('Manager', 'HR Staff', 'Administrator'), ctrl.reject);
router.put('/requests/:id/cancel', authorize('Employee', 'Administrator'), ctrl.cancel);
router.get('/balances', authorize('Employee', 'Administrator', 'HR Staff'), ctrl.getBalances);
router.get('/types', authorize('Administrator', 'HR Staff', 'Employee'), ctrl.getLeaveTypes);

module.exports = router;
