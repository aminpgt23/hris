const express = require('express');
const router = express.Router();
const ctrl = require('./position.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/', authorize('Administrator', 'HR Staff'), ctrl.getAll);
router.get('/:id', authorize('Administrator', 'HR Staff'), ctrl.getById);
router.post('/', authorize('Administrator', 'HR Staff'), ctrl.create);
router.put('/:id', authorize('Administrator', 'HR Staff'), ctrl.update);
router.delete('/:id', authorize('Administrator'), ctrl.remove);

module.exports = router;
