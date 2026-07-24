import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './Approvals.css';

const statusBadge = {
  'Pending Manager': <Badge variant="warning" dot>Pending Manager</Badge>,
  'Pending HR': <Badge variant="warning" dot>Pending HR</Badge>,
  'Approved': <Badge variant="success">Approved</Badge>,
  'Rejected': <Badge variant="danger">Rejected</Badge>,
  'Cancelled': <Badge variant="neutral">Cancelled</Badge>,
};

export default function Approvals() {
  const toast = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const isManager = user?.roleName === 'Manager';
  const isHR = user?.roleName === 'HR Staff';
  const isAdmin = user?.roleName === 'Administrator';

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter !== 'all' ? filter : undefined;
      const res = await api.get('/leave/requests', { params: { status: statusParam, limit: 50 } });
      setRequests(res.data?.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleApprove = async (id, status) => {
    try {
      if (status === 'Pending Manager') {
        await api.put(`/leave/requests/${id}/approve-manager`);
      } else {
        await api.put(`/leave/requests/${id}/approve-hr`);
      }
      toast.success('Leave request approved');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await api.put(`/leave/requests/${rejectId}/reject`, { rejection_reason: rejectReason });
      toast.success('Leave request rejected');
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason('');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    }
  };

  const openReject = (id) => {
    setRejectId(id);
    setRejectReason('');
    setRejectOpen(true);
  };

  const visibleRequests = requests.filter(r => {
    if (isManager && !isAdmin) return r.status === 'Pending Manager';
    if (isHR && !isAdmin) return r.status === 'Pending HR' || r.status === 'Pending Manager';
    return true;
  });

  const canApprove = (status) => {
    if (isAdmin) return status === 'Pending Manager' || status === 'Pending HR';
    if (isManager) return status === 'Pending Manager';
    if (isHR) return status === 'Pending HR';
    return false;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Approvals</h1>
        <p>Review and manage pending leave requests</p>
      </div>

      <div className="apr-stats">
        <Card className="apr-stat-card">
          <div className="apr-stat-value" style={{ color: 'var(--color-warning)' }}>
            {requests.filter(r => r.status === 'Pending Manager' || r.status === 'Pending HR').length}
          </div>
          <div className="apr-stat-label">Awaiting Approval</div>
        </Card>
        <Card className="apr-stat-card">
          <div className="apr-stat-value" style={{ color: 'var(--color-success)' }}>
            {requests.filter(r => r.status === 'Approved').length}
          </div>
          <div className="apr-stat-label">Approved</div>
        </Card>
        <Card className="apr-stat-card">
          <div className="apr-stat-value" style={{ color: 'var(--color-danger)' }}>
            {requests.filter(r => r.status === 'Rejected').length}
          </div>
          <div className="apr-stat-label">Rejected</div>
        </Card>
      </div>

      <div className="apr-tabs">
        {['all', 'pending manager', 'pending hr', 'approved', 'rejected'].map(f => (
          <button key={f} className={`apr-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="apr-refresh" onClick={loadRequests} title="Refresh">
          <RefreshIcon fontSize="small" />
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px', color: 'var(--color-text-tertiary)' }}>
          Loading requests...
        </div>
      ) : visibleRequests.length === 0 ? (
        <Card>
          <div className="text-center" style={{ padding: '40px', color: 'var(--color-text-tertiary)' }}>
            <p>No {filter !== 'all' ? filter : 'pending'} requests found</p>
          </div>
        </Card>
      ) : (
        <div className="apr-list">
          {visibleRequests.map(req => (
            <Card key={req.id} className="apr-item">
              <div className="apr-item-top">
                <div className="apr-avatar">
                  {(req.employee_name || '?')[0].toUpperCase()}
                </div>
                <div className="apr-info">
                  <div className="apr-employee">{req.employee_name || '-'}</div>
                  <div className="apr-meta">
                    {req.leave_type_name} &middot; {req.total_days} day{req.total_days > 1 ? 's' : ''}
                  </div>
                  <div className="apr-dates">
                    {req.start_date ? new Date(req.start_date).toLocaleDateString() : '-'}
                    {req.end_date ? ` → ${new Date(req.end_date).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div className="apr-status">{statusBadge[req.status] || req.status}</div>
              </div>

              {req.reason && (
                <div className="apr-reason">
                  <span className="apr-reason-label">Reason:</span> {req.reason}
                </div>
              )}

              <div className="apr-actions">
                <button className="apr-action view" onClick={() => { setDetailItem(req); setDetailOpen(true); }} title="View Details">
                  <VisibilityIcon fontSize="small" />
                </button>

                {canApprove(req.status) && (
                  <>
                    <button className="apr-action approve" onClick={() => handleApprove(req.id, req.status)} title="Approve">
                      <CheckCircleIcon fontSize="small" />
                      <span>Approve</span>
                    </button>
                    <button className="apr-action reject" onClick={() => openReject(req.id)} title="Reject">
                      <CancelIcon fontSize="small" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Leave Request Details" size="md">
        {detailItem && (
          <div className="apr-detail-grid">
            <div className="apr-detail-row">
              <span className="apr-detail-label">Employee</span>
              <span className="apr-detail-value">{detailItem.employee_name}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">Leave Type</span>
              <span className="apr-detail-value">{detailItem.leave_type_name}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">Status</span>
              <span className="apr-detail-value">{statusBadge[detailItem.status]}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">Start Date</span>
              <span className="apr-detail-value">{detailItem.start_date ? new Date(detailItem.start_date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">End Date</span>
              <span className="apr-detail-value">{detailItem.end_date ? new Date(detailItem.end_date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">Total Days</span>
              <span className="apr-detail-value">{detailItem.total_days}</span>
            </div>
            <div className="apr-detail-row">
              <span className="apr-detail-label">Reason</span>
              <span className="apr-detail-value">{detailItem.reason || '-'}</span>
            </div>
            {detailItem.rejection_reason && (
              <div className="apr-detail-row">
                <span className="apr-detail-label">Rejection Reason</span>
                <span className="apr-detail-value" style={{ color: 'var(--color-danger)' }}>{detailItem.rejection_reason}</span>
              </div>
            )}
          </div>
        )}
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setDetailOpen(false)}>Close</Button>
          {detailItem && canApprove(detailItem.status) && (
            <>
              <Button variant="danger" onClick={() => { setDetailOpen(false); openReject(detailItem.id); }}>
                <CancelIcon fontSize="small" /> Reject
              </Button>
              <Button variant="primary" onClick={() => { setDetailOpen(false); handleApprove(detailItem.id, detailItem.status); }}>
                <CheckCircleIcon fontSize="small" /> Approve
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Rejection Reason" size="sm">
        <div className="form-group">
          <label className="form-label">Reason for rejection (optional)</label>
          <textarea className="form-input" rows="3" value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter reason..." />
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject}>
            <CancelIcon fontSize="small" /> Confirm Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}