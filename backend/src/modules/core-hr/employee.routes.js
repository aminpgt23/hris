const express = require('express');
const router = express.Router();
const ctrl = require('./employee.controller');
const { authMiddleware, authorize } = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getAll);
router.get('/department/:deptId', authorize('Administrator', 'HR Staff'), ctrl.getByDepartment);
router.get('/:id', authorize('Administrator', 'HR Staff', 'Manager'), ctrl.getById);
router.post('/', authorize('Administrator', 'HR Staff'), ctrl.create);
router.put('/:id', authorize('Administrator', 'HR Staff'), ctrl.update);
router.delete('/:id', authorize('Administrator'), ctrl.delete);
router.get('/:id/history', authorize('Administrator', 'HR Staff'), ctrl.getHistory);
router.get('/:id/documents', authorize('Administrator', 'HR Staff', 'Employee'), ctrl.getDocuments);

module.exports = router;
