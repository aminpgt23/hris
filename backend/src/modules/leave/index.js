const express = require('express');
const router = express.Router();

router.use('/', require('./leave.routes'));
router.use('/types', require('./leaveType.routes'));
router.use('/balances', require('./balance.routes'));

module.exports = router;
