import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import './CoreHR.css';

const statusBadge = {
  Permanent: <Badge variant="success">Permanent</Badge>,
  Contract: <Badge variant="info">Contract</Badge>,
  Probation: <Badge variant="warning">Probation</Badge>,
  Intern: <Badge variant="neutral">Intern</Badge>,
  Resigned: <Badge variant="danger">Resigned</Badge>,
  Terminated: <Badge variant="danger">Terminated</Badge>,
};

const columns = [
  { key: 'employee_number', label: 'Emp #', width: '100px' },
  { key: 'full_name', label: 'Full Name', render: (v, r) => v || `${r.first_name || ''} ${r.last_name || ''}`.trim() || '-' },
  { key: 'department_name', label: 'Department', render: (v) => v || '-' },
  { key: 'position_name', label: 'Position', render: (v) => v || '-' },
  { key: 'employment_status', label: 'Status', render: (v) => statusBadge[v] || v || '-' },
];

const EXCLUDE_DETAIL = ['id', 'created_at', 'updated_at', 'deleted_at', 'password_hash'];

function formatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined) return '-';
  if (key === 'is_active') return value ? 'Active' : 'Inactive';
  if (key.includes('date') || key.includes('Date') || key === 'created_at' || key === 'updated_at') {
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(value).toLocaleDateString();
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/core-hr/employees', { params: { search, limit: 100 } });
      setEmployees(res.data?.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadEmployees(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!search) loadEmployees(); }, [search]);

  const handleSearch = () => { loadEmployees(); };

  const handleRowClick = (employee) => {
    setDetailItem(employee);
    setDetailOpen(true);
  };

  const detailFields = detailItem
    ? Object.keys(detailItem).filter(k => !EXCLUDE_DETAIL.includes(k))
    : [];

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Employees</h1>
          <p>Manage employee master data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadEmployees}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="search-field">
            <span className="search-icon"><SearchIcon fontSize="small" /></span>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="table-search-input"
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={employees}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No employees found"
          maxHeight="480px"
          sticky
        />
      </Card>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Employee: ${detailItem?.full_name || detailItem?.employee_number || ''}`}>
        {detailItem && (
          <div className="detail-grid">
            {detailFields.map(key => (
              <div key={key} className="detail-row">
                <span className="detail-label">{formatLabel(key)}</span>
                <span className="detail-value">
                  {key === 'employment_status' ? (statusBadge[detailItem[key]] || detailItem[key] || '-')
                  : key === 'is_active' ? <Badge variant={detailItem[key] ? 'success' : 'muted'}>{detailItem[key] ? 'Active' : 'Inactive'}</Badge>
                  : formatValue(key, detailItem[key])}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
            <CloseIcon fontSize="small" /> Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
