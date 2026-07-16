import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import './Training.css';

const statusBadge = {
  'Planned': <Badge variant="neutral">Planned</Badge>,
  'Open': <Badge variant="success">Open</Badge>,
  'Full': <Badge variant="warning">Full</Badge>,
  'InProgress': <Badge variant="info">In Progress</Badge>,
  'Completed': <Badge variant="neutral">Completed</Badge>,
  'Cancelled': <Badge variant="danger">Cancelled</Badge>,
};

const enrollmentBadge = {
  'Nominated': <Badge variant="info">Nominated</Badge>,
  'Registered': <Badge variant="success">Registered</Badge>,
  'Confirmed': <Badge variant="primary">Confirmed</Badge>,
  'Completed': <Badge variant="neutral">Completed</Badge>,
  'Withdrawn': <Badge variant="danger">Withdrawn</Badge>,
};

const tabs = [
  { id: 'programs', label: 'Programs' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'enrollments', label: 'Enrollments' },
];

export default function Training() {
  const toast = useToast();
  const [view, setView] = useState('programs');
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    company_id: 1, code: '', title: '', description: '', category: 'Technical',
    type: 'Internal', duration_hours: '', cost_estimate: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, eRes] = await Promise.all([
        api.get('/training/programs').catch(() => ({ data: { data: [] } })),
        api.get('/training/sessions').catch(() => ({ data: { data: [] } })),
        api.get('/training/enrollments').catch(() => ({ data: { data: [] } })),
      ]);
      setPrograms(pRes.data?.data || []);
      setSessions(sRes.data?.data || []);
      setEnrollments(eRes.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/training/programs/${editing.id}`, form);
        toast.success('Program updated successfully');
      } else {
        await api.post('/training/programs', form);
        toast.success('Program created successfully');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ company_id: 1, code: '', title: '', description: '', category: 'Technical', type: 'Internal', duration_hours: '', cost_estimate: '' });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setEditing(program);
    setForm({
      company_id: program.company_id || 1, code: program.code || '',
      title: program.title || '', description: program.description || '',
      category: program.category || 'Technical', type: program.type || 'Internal',
      duration_hours: program.duration_hours || '', cost_estimate: program.cost_estimate || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/training/programs/${id}`);
      toast.success('Program deleted successfully');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete program');
    }
  };

  const handleEnroll = async (sessionId) => {
    try {
      await api.post('/training/enroll', { training_session_id: sessionId });
      toast.success('Enrolled successfully!');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleEnrollmentUpdate = async (id, data) => {
    try {
      await api.put(`/training/enrollments/${id}`, data);
      toast.success('Enrollment updated');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update enrollment');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ company_id: 1, code: '', title: '', description: '', category: 'Technical', type: 'Internal', duration_hours: '', cost_estimate: '' });
    setModalOpen(true);
  };

  const renderTable = (columns, data) => (
    <div className="table-scroll-wrapper">
      <table className="data-table">
        <thead>
          <tr>{columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center" style={{ padding: '40px' }}>Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center" style={{ padding: '40px', color: 'var(--color-text-tertiary)' }}>No data found.</td></tr>
          ) : data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const programCols = [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'title', label: 'Program' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'duration_hours', label: 'Hours', render: (v) => v ? `${v}h` : '-' },
    { key: 'cost_estimate', label: 'Cost', render: (v) => v ? `Rp${Number(v).toLocaleString()}` : '-' },
    { key: 'id', label: '', width: '100px',
      render: (v, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="tbl-action" onClick={() => handleEdit(r)} title="Edit"><EditIcon fontSize="small" /></button>
          <button className="tbl-action danger" onClick={() => handleDelete(v)} title="Delete"><DeleteIcon fontSize="small" /></button>
        </div>
      ),
    },
  ];

  const sessionCols = [
    { key: 'session_code', label: 'Code', width: '90px' },
    { key: 'program_title', label: 'Program' },
    { key: 'title', label: 'Session' },
    { key: 'trainer_name', label: 'Trainer', render: (v) => v || '-' },
    { key: 'start_datetime', label: 'Start', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (v) => statusBadge[v] || v },
    { key: 'id', label: '', width: '90px',
      render: (v, r) => (
        <Button variant="outline" size="sm" onClick={() => handleEnroll(v)}
          disabled={r.status === 'Full' || r.status === 'Cancelled'}>
          <PersonAddIcon fontSize="small" /> Enroll
        </Button>
      ),
    },
  ];

  const enrollCols = [
    { key: 'employee_number', label: 'ID', width: '80px' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'program_title', label: 'Program' },
    { key: 'session_title', label: 'Session' },
    { key: 'enrollment_status', label: 'Status', render: (v) => enrollmentBadge[v] || v },
    { key: 'id', label: '', width: '120px',
      render: (v, r) => (
        <select className="form-input tbl-select" value={r.enrollment_status}
          onChange={(e) => handleEnrollmentUpdate(v, { enrollment_status: e.target.value })}>
          <option value="Registered">Registered</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      ),
    },
  ];

  return (
    <div className="training-module">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Training</h1>
          <p>Manage training programs, sessions, and enrollments</p>
        </div>
        {view === 'programs' && (
          <Button variant="primary" onClick={openCreate}><AddIcon fontSize="small" /> Add Program</Button>
        )}
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-4)' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${view === t.id ? 'active' : ''}`} onClick={() => setView(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'programs' && <Card>{renderTable(programCols, programs)}</Card>}
      {view === 'sessions' && <Card>{renderTable(sessionCols, sessions)}</Card>}
      {view === 'enrollments' && <Card>{renderTable(enrollCols, enrollments)}</Card>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Program' : 'Add Program'}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Code</label>
              <input type="text" className="form-input" value={form.code}
                onChange={e => setForm({...form, code: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}>
                <option>Technical</option><option>Leadership</option>
                <option>Finance</option><option>Compliance</option><option>Sales</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="2" value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}>
                <option>Internal</option><option>External</option><option>Online</option>
                <option>Workshop</option><option>Seminar</option><option>Certification</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (hours)</label>
              <input type="number" className="form-input" value={form.duration_hours}
                onChange={e => setForm({...form, duration_hours: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cost Estimate (IDR)</label>
            <input type="number" className="form-input" value={form.cost_estimate}
              onChange={e => setForm({...form, cost_estimate: e.target.value})} />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
