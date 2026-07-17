import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import './Attendance.css';

const statusBadge = {
  Present: <Badge variant="success">Present</Badge>,
  Late: <Badge variant="warning">Late</Badge>,
  Absent: <Badge variant="danger">Absent</Badge>,
  'On Leave': <Badge variant="info">On Leave</Badge>,
  WFH: <Badge variant="info">WFH</Badge>,
  'Half Day': <Badge variant="neutral">Half Day</Badge>,
};

export default function Attendance() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, wfh: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadRecords = async () => {
    setLoading(true);
    try {
      const [recRes, summRes] = await Promise.all([
        api.get('/attendance', { params: { search, limit: 50 } }).catch(() => ({ data: { data: [] } })),
        api.get('/attendance/summary/daily').catch(() => ({ data: { data: {} } })),
      ]);
      setRecords(recRes.data?.data || []);
      const s = summRes.data?.data || {};
      setStats({ present: s.present || 0, absent: s.absent || 0, late: s.late || 0, wfh: s.wfh || 0 });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRecords(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!search) loadRecords(); }, [search]);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { method: 'Web' });
      toast.success(res.data.message || 'Check-in successful');
      loadRecords();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out', { method: 'Web' });
      toast.success(res.data.message || 'Check-out successful');
      loadRecords();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-out failed');
    }
  };

  const handleSearch = () => { loadRecords(); };

  const filtered = records.filter(r => {
    if (filter === 'all') return true;
    return (r.status || '').toLowerCase() === filter;
  });

  const columns = [
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'employee_name', label: 'Employee', render: (v, r) => v || r.employee || '-' },
    { key: 'check_in_time', label: 'Check In', render: (v) => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'check_out_time', label: 'Check Out', render: (v) => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'status', label: 'Status', render: (v) => statusBadge[v] || v || '-' },
    { key: 'work_hours', label: 'Hours', render: (v) => v ? `${Number(v).toFixed(1)}h` : '-' },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Attendance</h1>
          <p>Manage employee attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCheckIn}><PlayArrowIcon fontSize="small" /> Check In</Button>
          <Button variant="outline" size="sm" onClick={handleCheckOut}><StopIcon fontSize="small" /> Check Out</Button>
          <Button variant="ghost" size="sm" onClick={loadRecords}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="att-stat"><div className="att-stat-value" style={{ color: 'var(--color-success)' }}>{stats.present}</div><div className="att-stat-label">Present</div></Card>
        <Card className="att-stat"><div className="att-stat-value" style={{ color: 'var(--color-danger)' }}>{stats.absent}</div><div className="att-stat-label">Absent</div></Card>
        <Card className="att-stat"><div className="att-stat-value" style={{ color: 'var(--color-warning)' }}>{stats.late}</div><div className="att-stat-label">Late</div></Card>
        <Card className="att-stat"><div className="att-stat-value" style={{ color: 'var(--color-info)' }}>{stats.wfh}</div><div className="att-stat-label">WFH</div></Card>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="search-field">
            <span className="search-icon"><SearchIcon fontSize="small" /></span>
            <input type="text" placeholder="Search employee..." className="table-search-input"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="attendance-tabs">
            {['all', 'present', 'late', 'absent'].map(f => (
              <button key={f} className={`att-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No attendance records found" sticky maxHeight="440px" />
      </Card>
    </div>
  );
}
