const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// ========== PROGRAMS ==========

router.get('/programs', authorize('Administrator', 'HR Staff', 'Employee'), async (req, res, next) => {
  try {
    let query = 'SELECT * FROM training_programs WHERE is_active = TRUE';
    const params = [];
    if (req.query.search) { query += ' AND title LIKE ?'; params.push(`%${req.query.search}%`); }
    query += ' ORDER BY title';
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/programs', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { company_id, code, title, description, category, type, duration_hours, cost_estimate } = req.body;
    if (!company_id || !code || !title) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, title' });
    }
    const [result] = await db.execute(
      `INSERT INTO training_programs (company_id, code, title, description, category, type, duration_hours, cost_estimate, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [company_id, code, title, description || null, category || null, type || 'Internal', duration_hours || null, cost_estimate || null]
    );
    res.status(201).json({ success: true, message: 'Program created', data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/programs/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { title, description, category, type, duration_hours, cost_estimate, is_active } = req.body;
    const [result] = await db.execute(
      'UPDATE training_programs SET title=?, description=?, category=?, type=?, duration_hours=?, cost_estimate=?, is_active=? WHERE id=?',
      [title, description, category, type, duration_hours, cost_estimate, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Program not found' });
    res.json({ success: true, message: 'Program updated' });
  } catch (error) { next(error); }
});

router.delete('/programs/:id', authorize('Administrator'), async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM training_programs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Program not found' });
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) { next(error); }
});

// ========== SESSIONS ==========

router.get('/sessions', authorize('Administrator', 'HR Staff', 'Employee'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT ts.*, tp.title as program_title
       FROM training_sessions ts
       JOIN training_programs tp ON ts.training_program_id = tp.id
       ORDER BY ts.start_datetime DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/sessions', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { training_program_id, session_code, title, trainer_name, venue, start_datetime, end_datetime, max_participants } = req.body;
    if (!training_program_id || !session_code || !title) {
      return res.status(400).json({ success: false, message: 'Required: training_program_id, session_code, title' });
    }
    const [result] = await db.execute(
      `INSERT INTO training_sessions (training_program_id, session_code, title, trainer_name, venue, start_datetime, end_datetime, max_participants, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [training_program_id, session_code, title, trainer_name || null, venue || null, start_datetime || null, end_datetime || null, max_participants || null]
    );
    res.status(201).json({ success: true, message: 'Session created', data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/sessions/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { title, trainer_name, venue, start_datetime, end_datetime, max_participants, status } = req.body;
    const [result] = await db.execute(
      'UPDATE training_sessions SET title=?, trainer_name=?, venue=?, start_datetime=?, end_datetime=?, max_participants=?, status=? WHERE id=?',
      [title, trainer_name, venue, start_datetime, end_datetime, max_participants, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session updated' });
  } catch (error) { next(error); }
});

router.delete('/sessions/:id', authorize('Administrator'), async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM training_sessions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) { next(error); }
});

// ========== ENROLLMENTS ==========

router.post('/enroll', authorize('Employee', 'Administrator'), async (req, res, next) => {
  try {
    const { training_session_id } = req.body;
    const employeeId = req.user.employeeId;
    if (!training_session_id) return res.status(400).json({ success: false, message: 'Session ID required' });

    await db.execute(
      `INSERT INTO training_enrollments (training_session_id, employee_id, enrollment_status)
       VALUES (?, ?, 'Registered')`,
      [training_session_id, employeeId]
    );
    res.status(201).json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Already enrolled in this session' });
    }
    next(error);
  }
});

router.get('/enrollments', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT te.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              ts.title as session_title, tp.title as program_title
       FROM training_enrollments te
       JOIN training_sessions ts ON te.training_session_id = ts.id
       JOIN training_programs tp ON ts.training_program_id = tp.id
       JOIN employees e ON te.employee_id = e.id
       ORDER BY te.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.put('/enrollments/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { enrollment_status, pre_test_score, post_test_score, evaluation_score } = req.body;
    await db.execute(
      'UPDATE training_enrollments SET enrollment_status=?, pre_test_score=?, post_test_score=?, evaluation_score=? WHERE id=?',
      [enrollment_status, pre_test_score, post_test_score, evaluation_score, req.params.id]
    );
    res.json({ success: true, message: 'Enrollment updated' });
  } catch (error) { next(error); }
});

module.exports = router;
