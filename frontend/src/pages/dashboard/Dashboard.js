import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui';
import { HRISLineChart, HRISAreaChart, HRISPieChart, CHART_COLORS } from '../../components/charts';
import api from '../../services/api';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color, trend, trendUp }) => (
  <Card className="stat-card">
    <div className="stat-card-inner">
      <div className="stat-card-info">
        <p className="stat-card-label">{title}</p>
        <span className="stat-card-value display-number">{value ?? '-'}</span>
        <p className={`stat-card-trend ${trendUp ? 'trend-up' : 'trend-neutral'}`}>{trend}</p>
      </div>
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
    </div>
  </Card>
);

const AttendanceItem = ({ value, label, color }) => (
  <div className="attendance-item">
    <span className="attendance-value" style={{ color }}>{value ?? 0}</span>
    <span className="attendance-label">{label}</span>
  </div>
);

const AttendanceSummary = ({ data }) => (
  <div className="attendance-summary">
    <div className="attendance-grid">
      <AttendanceItem value={data?.present} label="Present" color="var(--color-success)" />
      <AttendanceItem value={data?.absent} label="Absent" color="var(--color-danger)" />
      <AttendanceItem value={data?.late} label="Late" color="var(--color-warning)" />
      <AttendanceItem value={data?.wfh || data?.['work-from-home'] || data?.WFH} label="WFH" color="var(--color-info)" />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [headcountData, setHeadcountData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [deptHeadcount, setDeptHeadcount] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const [statsRes, hcRes, prRes, deptRes, attRes] = await Promise.all([
          api.get('/reports/dashboard/stats').catch(() => ({ data: { data: null } })),
          api.get('/reports/dashboard/headcount').catch(() => ({ data: { data: [] } })),
          api.get('/reports/dashboard/payroll-cost').catch(() => ({ data: { data: [] } })),
          api.get('/reports/generate/headcount').catch(() => ({ data: { data: [] } })),
          api.get('/attendance/summary/daily').catch(() => ({ data: { data: null } })),
        ]);
        if (cancelled) return;

        setStats(statsRes.data?.data || null);

        // Transform headcount data: API has {month, hires} → chart needs {month, total, new, left}
        const hcRaw = hcRes.data?.data || [];
        if (hcRaw.length > 0) {
          let running = 0;
          setHeadcountData(hcRaw.map((r, i) => {
            running += r.hires;
            const monthLabel = r.month ? new Date(r.month + '-01').toLocaleString('en', { month: 'short' }) : `M${i + 1}`;
            return { month: monthLabel, total: running, new: r.hires, left: 0 };
          }));
        } else {
          setHeadcountData([]);
        }

        // Transform payroll data
        const prRaw = prRes.data?.data || [];
        setPayrollData(prRaw.reverse().map(r => ({
          month: r.name ? r.name.split(' ')[0] : '-',
          gross: r.total_gross || 0,
          net: r.total_net || 0,
        })));

        // Transform dept headcount
        const deptRaw = deptRes.data?.data || [];
        setDeptHeadcount(deptRaw.filter(d => d.total > 0).map(d => ({
          name: d.department,
          value: d.total,
        })));

        // Attendance summary
        setAttendanceSummary(attRes.data?.data || null);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  const totalEmployees = stats?.totalEmployees || 0;
  const presentToday = stats?.presentToday || 0;
  const pendingApprovals = stats?.pendingApprovals || 0;
  const onLeave = attendanceSummary ? (attendanceSummary['On Leave'] || attendanceSummary['on_leave'] || 0) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to HRIS System Enterprise</p>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
          Some dashboard data could not be loaded. Displaying partial information.
        </div>
      )}

      <div className="stats-grid">
        <StatCard title="Total Employees" value={totalEmployees} icon={<PeopleIcon />} color={CHART_COLORS[0]} trend="Active employees" />
        <StatCard title="Present Today" value={presentToday} icon={<CheckCircleIcon />} color={CHART_COLORS[2]}
          trend={totalEmployees ? `${Math.round((presentToday / totalEmployees) * 100)}% attendance rate` : '-'} />
        <StatCard title="On Leave" value={onLeave} icon={<BeachAccessIcon />} color={CHART_COLORS[4]} trend="Employees away" />
        <StatCard title="Pending Approvals" value={pendingApprovals} icon={<HourglassEmptyIcon />} color={CHART_COLORS[3]} trend={pendingApprovals > 0 ? 'Requires attention' : 'All clear'} />
      </div>

      <div className="content-grid">
        <Card title="Headcount Trend" subtitle={headcountData.length > 0 ? 'Last 6 months' : 'No data available'}>
          {headcountData.length > 0 ? (
            <HRISLineChart
              data={headcountData} xKey="month"
              lines={[
                { key: 'total', name: 'Total Employees', color: CHART_COLORS[0] },
                { key: 'new', name: 'New Hires', color: CHART_COLORS[2] },
              ]}
              height={280}
            />
          ) : (
            <div className="chart-empty">Headcount data not available yet</div>
          )}
        </Card>

        <Card title="Department Headcount" subtitle="Current distribution">
          {deptHeadcount.length > 0 ? (
            <HRISPieChart data={deptHeadcount} dataKey="value" nameKey="name" height={280} donut />
          ) : (
            <div className="chart-empty">No department data available</div>
          )}
        </Card>

        <Card title="Payroll Cost Overview" subtitle={payrollData.length > 0 ? 'Monthly gross vs net' : 'No data available'}>
          {payrollData.length > 0 ? (
            <HRISAreaChart
              data={payrollData} xKey="month"
              areas={[
                { key: 'gross', name: 'Gross Salary', color: CHART_COLORS[0] },
                { key: 'net', name: 'Net Salary', color: CHART_COLORS[2] },
              ]}
              height={280}
            />
          ) : (
            <div className="chart-empty">Payroll data not available yet</div>
          )}
        </Card>

        <Card title="Attendance Summary" subtitle="Today's overview">
          {attendanceSummary ? (
            <AttendanceSummary data={attendanceSummary} />
          ) : (
            <div className="chart-empty">Attendance data not available yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
