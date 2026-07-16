const express = require('express');
const router = express.Router();
const ctrl = require('./holiday.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/', authorize('Administrator', 'HR Staff'), ctrl.getAll);
router.post('/', authorize('Administrator', 'HR Staff'), ctrl.create);
router.delete('/:id', authorize('Administrator'), ctrl.remove);

module.exports = router;
