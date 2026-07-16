import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import './Leave.css';

const statusBadge = {
  'Pending Manager': <Badge variant="warning" dot>Pending Manager</Badge>,
  'Pending HR': <Badge variant="warning" dot>Pending HR</Badge>,
  'Approved': <Badge variant="success">Approved</Badge>,
  'Rejected': <Badge variant="danger">Rejected</Badge>,
  'Cancelled': <Badge variant="neutral">Cancelled</Badge>,
};

export default function LeaveManagement() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, balRes, typeRes] = await Promise.all([
        api.get('/leave/requests').catch(() => ({ data: { data: [] } })),
        api.get('/leave/balances').catch(() => ({ data: { data: [] } })),
        api.get('/leave/types').catch(() => ({ data: { data: [] } })),
      ]);
      setRequests(reqRes.data?.data || []);
      setBalances(balRes.data?.data || []);
      setLeaveTypes(typeRes.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave/requests', form);
      setModalOpen(false);
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      toast.success('Leave request submitted successfully');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleApprove = async (id, level) => {
    try {
      if (level === 'manager') await api.put(`/leave/requests/${id}/approve-manager`);
      else await api.put(`/leave/requests/${id}/approve-hr`);
      toast.success('Leave approved');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/leave/requests/${id}/reject`);
      toast.success('Leave rejected');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    }
  };

  const filtered = requests.filter(r => {
    if (filter === 'all') return true;
    return (r.status || '').toLowerCase().includes(filter);
  });

  const columns = [
    { key: 'employee_name', label: 'Employee', render: (v, r) => v || r.employee || '-' },
    { key: 'leave_type_name', label: 'Leave Type', render: (v, r) => v || r.type || '-' },
    { key: 'start_date', label: 'Start', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'end_date', label: 'End', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'total_days', label: 'Days', render: (v) => v ?? '-' },
    { key: 'status', label: 'Status', render: (v) => statusBadge[v] || v || '-' },
    { key: 'id', label: '', width: '120px',
      render: (v, r) => (
        <div className="flex gap-1">
          {(r.status === 'Pending Manager' || r.status === 'Pending HR') && (
            <>
              <button className="tbl-action" onClick={() => handleApprove(v, r.status === 'Pending HR' ? 'hr' : 'manager')} title="Approve">
                <CheckCircleIcon fontSize="small" />
              </button>
              <button className="tbl-action danger" onClick={() => handleReject(v)} title="Reject">
                <CancelIcon fontSize="small" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Leave Management</h1>
          <p>Manage leave requests and balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><AddIcon fontSize="small" /> New Request</Button>
          <Button variant="ghost" size="sm" onClick={loadData}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="stats-grid">
        {leaveTypes.slice(0, 4).map(lt => {
          const bal = balances.find(b => b.leave_type_id === lt.id);
          const remaining = bal ? bal.closing_balance : lt.default_days_per_year || 0;
          const total = lt.default_days_per_year || 12;
          return (
            <Card key={lt.id} className="leave-balance">
              <div className="lb-type" style={{ color: 'var(--color-primary)' }}>{lt.name}</div>
              <div className="lb-days">
                <span className="lb-remaining">{remaining}</span>
                <span className="lb-total">/ {total}</span>
              </div>
              <div className="lb-label">Remaining / Total</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="attendance-tabs" style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>
          {['all', 'pending manager', 'pending hr', 'approved', 'rejected'].map(f => (
            <button key={f} className={`att-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No leave requests found" sticky maxHeight="440px" />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Leave Request">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-input" value={form.leave_type_id}
              onChange={e => setForm({...form, leave_type_id: e.target.value})} required>
              <option value="">Select type...</option>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={form.start_date}
                onChange={e => setForm({...form, start_date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={form.end_date}
                onChange={e => setForm({...form, end_date: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-input" rows="3" value={form.reason}
              onChange={e => setForm({...form, reason: e.target.value})} required />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
