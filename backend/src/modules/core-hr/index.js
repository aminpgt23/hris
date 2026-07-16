const express = require('express');
const router = express.Router();

router.use('/employees', require('./employee.routes'));
router.use('/departments', require('./department.routes'));
router.use('/positions', require('./position.routes'));
router.use('/organization', require('./organization.routes'));

module.exports = router;
