const express = require('express');
const router = express.Router();
const ctrl = require('./attendance.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);

router.post('/check-in', authorize('Employee', 'Administrator'), ctrl.checkIn);
router.post('/check-out', authorize('Employee', 'Administrator'), ctrl.checkOut);
router.get('/', authorize('Administrator', 'HR Staff', 'Manager', 'Employee'), ctrl.getRecords);
router.get('/summary/daily', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getDailySummary);
router.get('/reports/monthly', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getMonthlyReport);

module.exports = router;
