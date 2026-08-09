import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import './ESS.css';

const attendanceBadge = {
  Present: <Badge variant="success">Present</Badge>,
  Late: <Badge variant="warning">Late</Badge>,
  Absent: <Badge variant="danger">Absent</Badge>,
  'On Leave': <Badge variant="info">On Leave</Badge>,
  WFH: <Badge variant="info">WFH</Badge>,
};

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-';
  return `Rp ${Number(val).toLocaleString('id-ID')}`;
};

const EDITABLE_FIELDS = [
  { key: 'phone_personal', label: 'Personal Phone', type: 'text' },
  { key: 'email_personal', label: 'Personal Email', type: 'email' },
  { key: 'address_current', label: 'Address', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'province', label: 'Province', type: 'text' },
  { key: 'bank_name', label: 'Bank Name', type: 'text' },
  { key: 'bank_account_number', label: 'Bank Account No', type: 'text' },
  { key: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
  { key: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
];

export default function ESS() {
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [espStats, setEssStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [detailPayslip, setDetailPayslip] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, paysRes, aRes, dRes] = await Promise.all([
        api.get('/ess/profile').catch(() => ({ data: { data: null } })),
        api.get('/ess/payslips').catch(() => ({ data: { data: [] } })),
        api.get('/attendance', { params: { limit: 5 } }).catch(() => ({ data: { data: [] } })),
        api.get('/ess/dashboard').catch(() => ({ data: { data: null } })),
      ]);
      setProfile(pRes.data?.data || null);
      setPayslips(paysRes.data?.data || []);
      setAttendance(aRes.data?.data || []);
      setEssStats(dRes.data?.data || null);
    } catch { /* ignore */ }
    finally { setLoading(false) }
  };

  useEffect(() => { loadData(); }, []);

  const openEditProfile = () => {
    const form = {};
    EDITABLE_FIELDS.forEach(f => { form[f.key] = profile?.[f.key] || ''; });
    setEditForm(form);
    setEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      EDITABLE_FIELDS.forEach(f => { payload[f.key] = editForm[f.key] || ''; });
      await api.put('/ess/profile', payload);
      toast.success('Profile updated successfully');
      setEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { method: 'Web' });
      toast.success(res.data?.message || 'Check-in successful');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const initials = profile
    ? `${(profile.first_name || '')[0]}${(profile.last_name || '')[0]}`
    : '--';

  const latestPayslip = payslips[0] || null;
  const todayStatus = espStats?.todayAttendance;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Employee Self Service</h1>
          <p>Manage your profile, attendance, and requests</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}><RefreshIcon fontSize="small" /></Button>
      </div>

      {loading ? (
        <div className="content-grid">
          <Card><div className="text-center" style={{ padding: '20px' }}>Loading profile...</div></Card>
        </div>
      ) : (
        <div className="content-grid">
          {/* Profile Card */}
          <Card title="My Profile" subtitle={profile ? 'Personal information' : 'Profile not available'}>
            {profile ? (
              <>
                <div className="ess-profile">
                  <div className="ess-avatar">{initials}</div>
                  <div className="ess-info">
                    <div className="ess-name">
                      {profile.first_name} {profile.last_name}
                    </div>
                    <div className="ess-detail">{profile.employee_number || ''}</div>
                    <div className="ess-detail">{profile.position_name || profile.position || ''}</div>
                    <div className="ess-detail">{profile.department_name || profile.department || ''}</div>
                  </div>
                </div>
                <div className="ess-actions">
                  <Button variant="outline" size="sm" fullWidth onClick={openEditProfile}>Edit Profile</Button>
                </div>
              </>
            ) : (
              <div className="text-center" style={{ padding: '20px', color: 'var(--color-text-tertiary)' }}>
                Profile not linked to user account
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="ess-quick-actions">
              <button className="ess-quick-btn" title={todayStatus?.check_in_time ? 'Already checked in' : 'Check in now'}
                disabled={!!todayStatus?.check_in_time} onClick={handleCheckIn}>
                <span className="eq-icon"><AccessTimeIcon /></span>
                <span className="eq-label">{todayStatus?.check_in_time ? 'Checked In' : 'Check In'}</span>
              </button>
              <button className="ess-quick-btn" onClick={() => navigate('/leave')}>
                <span className="eq-icon"><BeachAccessIcon /></span>
                <span className="eq-label">Apply Leave</span>
              </button>
              <button className="ess-quick-btn" onClick={() => navigate('/my-payslip')}>
                <span className="eq-icon"><AccountBalanceWalletIcon /></span>
                <span className="eq-label">Payslip</span>
              </button>
              <button className="ess-quick-btn" onClick={() => navigate('/attendance')}>
                <span className="eq-icon"><BarChartIcon /></span>
                <span className="eq-label">My Hours</span>
              </button>
            </div>
          </Card>

          {/* Latest Payslip */}
          <Card title="Latest Payslip" subtitle={latestPayslip ? latestPayslip.period_name || '' : 'No data'}>
            {latestPayslip ? (
              <>
                <div className="ess-payslip">
                  <div className="ps-row"><span>Basic Salary</span><span>{formatCurrency(latestPayslip.basic_salary)}</span></div>
                  <div className="ps-row"><span>Allowances</span><span>{formatCurrency(latestPayslip.total_allowances)}</span></div>
                  <div className="ps-row"><span>Overtime</span><span>{formatCurrency(latestPayslip.overtime_pay)}</span></div>
                  <div className="ps-row ps-total"><span>Gross Salary</span><span>{formatCurrency(latestPayslip.gross_salary)}</span></div>
                  <div className="ps-row"><span>Deductions</span><span>-{formatCurrency(latestPayslip.deductions)}</span></div>
                  <div className="ps-row ps-net"><span>Net Salary</span><span>{formatCurrency(latestPayslip.net_salary)}</span></div>
                </div>
                <div className="ess-actions">
                  <Button variant="outline" size="sm" fullWidth onClick={() => setDetailPayslip(latestPayslip)}>View Full Payslip</Button>
                </div>
              </>
            ) : (
              <div className="text-center" style={{ padding: '20px', color: 'var(--color-text-tertiary)' }}>
                No payslip data available
              </div>
            )}
          </Card>

          {/* Recent Attendance */}
          <Card title="Attendance History" subtitle="Last 5 records">
            {attendance.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.id}>
                      <td>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
                      <td>{a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{attendanceBadge[a.status] || a.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center" style={{ padding: '20px', color: 'var(--color-text-tertiary)' }}>
                No attendance records
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg">
        <form onSubmit={handleSaveProfile}>
          <div className="form-row">
            {EDITABLE_FIELDS.map(f => (
              <div className="form-group" key={f.key} style={{ flex: 1 }}>
                <label className="form-label">{f.label}</label>
                <input
                  type={f.type}
                  className="form-input"
                  value={editForm[f.key] || ''}
                  onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Payslip Detail Modal */}
      <Modal open={!!detailPayslip} onClose={() => setDetailPayslip(null)} title={detailPayslip?.period_name || 'Payslip Detail'}>
        {detailPayslip && (
          <div className="ess-payslip-detail">
            <div className="ps-row"><span>Employee</span><span>{detailPayslip.employee_name || '-'}</span></div>
            <div className="ps-row"><span>Period</span><span>{detailPayslip.period_name || '-'}</span></div>
            <div className="ps-row"><span>Working Days</span><span>{detailPayslip.working_days ?? '-'}</span></div>
            <div className="ps-row"><span>Present Days</span><span>{detailPayslip.present_days ?? '-'}</span></div>
            <div className="ps-row"><span>Overtime Hours</span><span>{detailPayslip.overtime_hours ?? '-'}</span></div>
            <div className="ps-row"><span>Basic Salary</span><span>{formatCurrency(detailPayslip.basic_salary)}</span></div>
            <div className="ps-row"><span>Allowances</span><span>{formatCurrency(detailPayslip.total_allowances)}</span></div>
            <div className="ps-row"><span>Overtime Pay</span><span>{formatCurrency(detailPayslip.overtime_pay)}</span></div>
            <div className="ps-row ps-total"><span>Gross Salary</span><span>{formatCurrency(detailPayslip.gross_salary)}</span></div>
            <div className="ps-row"><span>BPJS Health</span><span>-{formatCurrency(detailPayslip.bpjs_health_employee)}</span></div>
            <div className="ps-row"><span>BPJS Employment</span><span>-{formatCurrency(detailPayslip.bpjs_employment_employee)}</span></div>
            <div className="ps-row"><span>Pension</span><span>-{formatCurrency(detailPayslip.pension_employee)}</span></div>
            <div className="ps-row"><span>PPh21</span><span>-{formatCurrency(detailPayslip.pph21_employee)}</span></div>
            <div className="ps-row"><span>Total Deductions</span><span>-{formatCurrency(detailPayslip.deductions)}</span></div>
            <div className="ps-row ps-net"><span>Net Salary</span><span>{formatCurrency(detailPayslip.net_salary)}</span></div>
            <div className="ps-row"><span>Payment Method</span><span>{detailPayslip.payment_method || '-'}</span></div>
            <div className="ps-row"><span>Payment Status</span><span>{detailPayslip.payment_status || '-'}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
