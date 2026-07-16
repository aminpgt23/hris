const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM shifts WHERE is_active = TRUE ORDER BY name'
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, code, name, start_time, end_time, work_hours } = req.body;
    if (!company_id || !code || !name || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name, start_time, end_time' });
    }
    const [result] = await db.execute(
      `INSERT INTO shifts (company_id, code, name, start_time, end_time, break_start, break_end, break_duration_minutes, work_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, start_time, end_time,
       req.body.break_start || null, req.body.break_end || null,
       req.body.break_duration_minutes || 60, work_hours || 8]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, start_time, end_time, work_hours, is_active } = req.body;
    const [result] = await db.execute(
      'UPDATE shifts SET name=?, start_time=?, end_time=?, work_hours=?, is_active=? WHERE id=?',
      [name, start_time, end_time, work_hours, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Shift not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM shifts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Shift not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
