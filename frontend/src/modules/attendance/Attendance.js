import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import FaceIcon from '@mui/icons-material/Face';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FaceCaptureModal from './FaceCaptureModal';
import OvertimePanel from './OvertimePanel';
import './Attendance.css';

const statusBadge = {
  Present: <Badge variant="success">Present</Badge>,
  Late: <Badge variant="warning">Late</Badge>,
  Absent: <Badge variant="danger">Absent</Badge>,
  'On Leave': <Badge variant="info">On Leave</Badge>,
  WFH: <Badge variant="info">WFH</Badge>,
  'Work From Home': <Badge variant="info">Work From Home</Badge>,
  'Half Day': <Badge variant="neutral">Half Day</Badge>,
};

const methodBadge = {
  Face: <Badge variant="success"><FaceIcon fontSize="inherit" /> Face</Badge>,
  Biometric: <Badge variant="info">Biometric</Badge>,
  Mobile: <Badge variant="neutral">Mobile</Badge>,
  Web: <Badge variant="neutral">Web</Badge>,
};

const PhotoThumb = ({ photo, onClick }) => (
  photo ? (
    <button className="att-photo-thumb" onClick={onClick} title="View photo">
      <img src={photo} alt="Attendance proof" />
    </button>
  ) : null
);
const geoLink = (lat, lng, name) => {
  if (lat && lng) {
    return (
      <a
        className="att-location-link"
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LocationOnIcon fontSize="inherit" /> {name || `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`}
      </a>
    );
  }
  return name ? <span className="att-location"><LocationOnIcon fontSize="inherit" /> {name}</span> : '-';
};

export default function Attendance() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, wfh: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [faceOpen, setFaceOpen] = useState(false);
  const [action, setAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoViewer, setPhotoViewer] = useState(null);
  const [view, setView] = useState('records');

  const loadRecords = useCallback(async () => {
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
  }, [search]);

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { if (!search) loadRecords(); }, [search, loadRecords]);

  const handleSearch = () => { loadRecords(); };

  const openFaceModal = (mode) => {
    setAction(mode);
    setFaceOpen(true);
  };

  const handleFaceSubmit = async (faceData) => {
    setSubmitting(true);
    try {
      const payload = {
        method: 'Face',
        photo: faceData.photo,
        location_lat: faceData.location_lat,
        location_lng: faceData.location_lng,
        location_name: faceData.location_name,
      };
      const res = await api.post(`/attendance/${action === 'in' ? 'check-in' : 'check-out'}`, payload);
      toast.success(res.data.message || (action === 'in' ? 'Check-in successful' : 'Check-out successful'));
      setFaceOpen(false);
      setAction(null);
      loadRecords();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Attendance submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWebCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { method: 'Web' });
      toast.success(res.data.message || 'Check-in successful');
      loadRecords();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed');
    }
  };

  const handleWebCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out', { method: 'Web' });
      toast.success(res.data.message || 'Check-out successful');
      loadRecords();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-out failed');
    }
  };

  const filtered = records.filter(r => {
    if (filter === 'all') return true;
    return (r.status || '').toLowerCase() === filter;
  });

  const columns = [
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'employee_name', label: 'Employee', render: (v, r) => v || r.employee || '-' },
    { key: 'check_in_time', label: 'Check In', render: (v, r) => v ? `${new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${r.check_in_method ? methodBadge[r.check_in_method] : ''}` : '-' },
    { key: 'check_out_time', label: 'Check Out', render: (v, r) => v ? `${new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${r.check_out_method ? methodBadge[r.check_out_method] : ''}` : '-' },
    { key: 'photos', label: 'Photos', render: (_, r) => (
        <div className="att-photos">
          <PhotoThumb photo={r.check_in_photo} onClick={() => setPhotoViewer({ record: r, which: 'in' })} />
          <PhotoThumb photo={r.check_out_photo} onClick={() => setPhotoViewer({ record: r, which: 'out' })} />
        </div>
      ) },
    { key: 'status', label: 'Status', render: (v) => statusBadge[v] || v || '-' },
    { key: 'location', label: 'Location', render: (_, r) => (
        <div className="att-locations">
          {geoLink(r.check_in_location_lat, r.check_in_location_lng, r.check_in_location_name)}
          {r.check_out_location_lat || r.check_out_location_name ? (
            <span className="att-loc-out">{geoLink(r.check_out_location_lat, r.check_out_location_lng, r.check_out_location_name)}</span>
          ) : null}
        </div>
      ) },
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
          <Button variant="primary" size="sm" onClick={() => openFaceModal('in')}><FaceIcon fontSize="small" /> Check In</Button>
          <Button variant="outline" size="sm" onClick={() => openFaceModal('out')}><StopIcon fontSize="small" /> Check Out</Button>
          <Button variant="ghost" size="sm" onClick={handleWebCheckIn} title="Quick check-in (Web)"><PlayArrowIcon fontSize="small" /></Button>
          <Button variant="ghost" size="sm" onClick={handleWebCheckOut} title="Quick check-out (Web)"><StopIcon fontSize="small" /></Button>
          <Button variant="ghost" size="sm" onClick={loadRecords}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="attendance-tabs" style={{ marginBottom: 'var(--space-4)' }}>
        {['records', 'overtime'].map(f => (
          <button key={f} className={`att-tab ${view === f ? 'active' : ''}`}
            onClick={() => setView(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {view === 'overtime' ? (
        <OvertimePanel />
      ) : (
      <>
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

      <FaceCaptureModal
        open={faceOpen}
        onClose={() => { setFaceOpen(false); setAction(null); }}
        onSubmit={handleFaceSubmit}
        submitting={submitting}
      />

      <Modal
        open={!!photoViewer}
        onClose={() => setPhotoViewer(null)}
        title={photoViewer ? `Attendance Photo - ${photoViewer.which === 'in' ? 'Check In' : 'Check Out'}` : ''}
      >
        {photoViewer && (
          <div className="att-photo-viewer">
            <img
              src={photoViewer.which === 'in' ? photoViewer.record.check_in_photo : photoViewer.record.check_out_photo}
              alt={`${photoViewer.which === 'in' ? 'Check-in' : 'Check-out'} evidence`}
            />
            <div className="att-photo-meta">
              <div className="ps-row">
                <span>Employee</span>
                <span>{photoViewer.record.employee_name || '-'}</span>
              </div>
              <div className="ps-row">
                <span>Time</span>
                <span>
                  {photoViewer.which === 'in'
                    ? (photoViewer.record.check_in_time ? new Date(photoViewer.record.check_in_time).toLocaleString() : '-')
                    : (photoViewer.record.check_out_time ? new Date(photoViewer.record.check_out_time).toLocaleString() : '-')}
                </span>
              </div>
              <div className="ps-row">
                <span>Location</span>
                <span>
                  {photoViewer.which === 'in'
                    ? (photoViewer.record.check_in_location_name
                        || (photoViewer.record.check_in_location_lat
                          ? `${Number(photoViewer.record.check_in_location_lat).toFixed(6)}, ${Number(photoViewer.record.check_in_location_lng).toFixed(6)}`
                          : '-'))
                    : (photoViewer.record.check_out_location_name
                        || (photoViewer.record.check_out_location_lat
                          ? `${Number(photoViewer.record.check_out_location_lat).toFixed(6)}, ${Number(photoViewer.record.check_out_location_lng).toFixed(6)}`
                          : '-'))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
      </>
      )}
    </div>
  );
}
