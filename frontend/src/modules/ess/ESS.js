import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
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

export default function ESS() {
  const [profile, setProfile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [espStats, setEssStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
                  <Button variant="outline" size="sm" fullWidth>Edit Profile</Button>
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
              <button className="ess-quick-btn" title={todayStatus?.check_in_time ? 'Already checked in' : 'Check in now'}>
                <span className="eq-icon"><AccessTimeIcon /></span>
                <span className="eq-label">{todayStatus?.check_in_time ? 'Checked In' : 'Check In'}</span>
              </button>
              <button className="ess-quick-btn">
                <span className="eq-icon"><BeachAccessIcon /></span>
                <span className="eq-label">Apply Leave</span>
              </button>
              <button className="ess-quick-btn">
                <span className="eq-icon"><AccountBalanceWalletIcon /></span>
                <span className="eq-label">Payslip</span>
              </button>
              <button className="ess-quick-btn">
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
                  <Button variant="outline" size="sm" fullWidth>View Full Payslip</Button>
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
    </div>
  );
}
