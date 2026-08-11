import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const overtimeBadge = {
  Pending: <Badge variant="warning">Pending</Badge>,
  Approved: <Badge variant="success">Approved</Badge>,
  Rejected: <Badge variant="danger">Rejected</Badge>,
  Revision: <Badge variant="neutral">Revision</Badge>,
};

const emptyForm = { date: '', start_time: '', end_time: '', reason: '', project_code: '' };

export default function OvertimePanel() {
  const toast = useToast();
  const { hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveHours, setApproveHours] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const canDecide = hasRole('Administrator', 'HR Staff', 'Manager');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/overtime', { params: statusFilter !== 'all' ? { status: statusFilter } : {} })
        .catch(() => ({ data: { data: [] } }));
      setRequests(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/attendance/overtime', form);
      toast.success('Overtime request submitted');
      setFormOpen(false);
      setForm({ ...emptyForm });
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit overtime request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/attendance/overtime/${approveTarget.id}/approve`, { approved_hours: Number(approveHours) });
      toast.success('Overtime approved');
      setApproveTarget(null);
      setApproveHours('');
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve overtime');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/attendance/overtime/${rejectTarget.id}/reject`, { rejection_reason: rejectReason });
      toast.success('Overtime rejected');
      setRejectTarget(null);
      setRejectReason('');
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject overtime');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'employee_name', label: 'Employee', render: (v) => v || '-' },
    { key: 'time_range', label: 'Time', render: (_, r) => r.start_time && r.end_time ? `${r.start_time.slice(0, 5)} - ${r.end_time.slice(0, 5)}` : '-' },
    { key: 'requested_hours', label: 'Requested (h)', render: (v) => v ? `${Number(v).toFixed(1)}h` : '-' },
    { key: 'approved_hours', label: 'Approved (h)', render: (v) => v ? `${Number(v).toFixed(1)}h` : '-' },
    { key: 'status', label: 'Status', render: (v) => overtimeBadge[v] || v || '-' },
    { key: 'reason', label: 'Reason', render: (v) => v ? (v.length > 30 ? v.slice(0, 30) + '...' : v) : '-' },
    { key: 'project_code', label: 'Project', render: (v) => v || '-' },
    { key: '_actions', label: '', render: (_, r) => (
        canDecide && r.status === 'Pending' ? (
          <div className="table-actions" onClick={e => e.stopPropagation()}>
            <button className="table-action-btn" title="Approve" onClick={() => { setApproveTarget(r); setApproveHours(String(r.requested_hours)); }}>
              <CheckIcon fontSize="small" />
            </button>
            <button className="table-action-btn delete" title="Reject" onClick={() => { setRejectTarget(r); setRejectReason(''); }}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        ) : null
      ) },
  ];

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ margin: 0 }}>Overtime Requests</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Request overtime and approve hours worked
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}><AddIcon fontSize="small" /> Request Overtime</Button>
          <Button variant="ghost" size="sm" onClick={loadRequests}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="attendance-tabs">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} className={`att-tab ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={requests} loading={loading} emptyMessage="No overtime requests found" sticky maxHeight="440px" />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Request Overtime">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" required value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" required value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" required value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-input" rows="3" required value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for overtime" />
          </div>
          <div className="form-group">
            <label className="form-label">Project Code (optional)</label>
            <input type="text" className="form-input" value={form.project_code}
              onChange={e => setForm({ ...form, project_code: e.target.value })} />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)} title={`Approve Overtime - ${approveTarget?.employee_name || ''}`}>
        {approveTarget && (
          <form onSubmit={handleApprove}>
            <div className="ps-row"><span>Date</span><span>{new Date(approveTarget.date).toLocaleDateString()}</span></div>
            <div className="ps-row"><span>Time</span><span>{approveTarget.start_time.slice(0, 5)} - {approveTarget.end_time.slice(0, 5)}</span></div>
            <div className="ps-row"><span>Requested Hours</span><span>{Number(approveTarget.requested_hours).toFixed(1)}h</span></div>
            <div className="ps-row"><span>Reason</span><span>{approveTarget.reason}</span></div>
            <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label className="form-label">Approved Hours</label>
              <input type="number" step="0.5" min="0.5" className="form-input" required value={approveHours}
                onChange={e => setApproveHours(e.target.value)} />
            </div>
            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={() => setApproveTarget(null)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Approve'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject Overtime - ${rejectTarget?.employee_name || ''}`}>
        {rejectTarget && (
          <form onSubmit={handleReject}>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea className="form-input" rows="3" value={rejectReason}
                onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
            </div>
            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button variant="danger" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Reject'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
