const express = require('express');
const router = express.Router();

router.use('/', require('./attendance.routes'));
router.use('/shifts', require('./shift.routes'));
router.use('/schedules', require('./schedule.routes'));
router.use('/overtime', require('./overtime.routes'));
router.use('/holidays', require('./holiday.routes'));

module.exports = router;
