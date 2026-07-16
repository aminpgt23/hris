const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// BPJS Health config
router.get('/bpjs-health', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM bpjs_health_config WHERE year = ? ORDER BY effective_from DESC', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// BPJS Employment config
router.get('/bpjs-employment', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM bpjs_employment_config WHERE year = ? ORDER BY effective_from DESC', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// Tax rates (PPh21)
router.get('/tax-rates', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM tax_rates WHERE year = ? AND is_active = TRUE ORDER BY layer_number', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

module.exports = router;
