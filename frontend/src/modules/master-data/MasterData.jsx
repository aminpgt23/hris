import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Badge, Table } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import './MasterData.css';

const sections = [
  { id: 'companies', label: 'Companies', icon: BusinessIcon },
  { id: 'branches', label: 'Branches', icon: AccountTreeIcon },
  { id: 'departments', label: 'Departments', icon: AccountTreeIcon },
  { id: 'positions', label: 'Positions', icon: BadgeIcon },
  { id: 'grades', label: 'Grades', icon: AttachMoneyIcon },
  { id: 'shifts', label: 'Shifts', icon: AccessTimeIcon },
  { id: 'holidays', label: 'Holidays', icon: EventIcon },
];

const sectionColumns = {
  companies: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'name', label: 'Company Name' },
    { key: 'city', label: 'City', render: (v) => v || '-' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  branches: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'name', label: 'Branch Name' },
    { key: 'city', label: 'City', render: (v) => v || '-' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  departments: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'name', label: 'Department' },
    { key: 'description', label: 'Description', render: (v) => v || '-' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  positions: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'title', label: 'Position Title' },
    { key: 'description', label: 'Description', render: (v) => v ? (v.length > 40 ? v.slice(0, 40) + '...' : v) : '-' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  grades: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'name', label: 'Grade Name' },
    { key: 'description', label: 'Description', render: (v) => v || '-' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  shifts: [
    { key: 'code', label: 'Code', width: '100px' },
    { key: 'name', label: 'Shift Name' },
    { key: 'start_time', label: 'Start', width: '90px' },
    { key: 'end_time', label: 'End', width: '90px' },
    { key: 'work_hours', label: 'Work Hours', width: '100px', render: (v) => v ? `${Number(v).toFixed(1)}h` : '-' },
    { key: 'is_paid_overtime', label: 'Paid OT', width: '80px', render: (v) => v ? 'Yes' : 'No' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
  holidays: [
    { key: 'name', label: 'Holiday Name' },
    { key: 'date', label: 'Date', width: '120px', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'is_recurring', label: 'Recurring', width: '90px', render: (v) => v ? 'Yes' : 'No' },
    { key: 'is_active', label: 'Status', width: '90px', render: (v) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ],
};

const emptyForm = { code: '', name: '', description: '', is_active: true };
const emptyShiftForm = {
  company_id: 1, code: '', name: '', start_time: '', end_time: '',
  break_start: '', break_end: '', break_duration_minutes: 60, work_hours: 8,
  is_paid_overtime: true, overtime_start_after_minutes: 0, is_active: true,
};

const EXCLUDE_DETAIL = ['id', 'created_at', 'updated_at', 'deleted_at', 'password_hash', 'password'];

function formatDetailValue(key, value) {
  if (value === null || value === undefined) return '-';
  if (key === 'is_active' || key === 'is_recurring') {
    return value ? 'Yes' : 'No';
  }
  if (key.includes('date') || key.includes('Date') || key === 'created_at' || key === 'updated_at') {
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString();
    }
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function MasterData() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('companies');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${activeSection}`);
      if (res.data?.data) {
        setData(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeSection]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/${activeSection}/${editing.id}`, form);
        toast.success(`${activeSectionLabel} updated successfully`);
      } else {
        await api.post(`/${activeSection}`, form);
        toast.success(`${activeSectionLabel} created successfully`);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ ...emptyForm });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to save ${activeSectionLabel}`);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    if (activeSection === 'shifts') {
      setForm({
        company_id: item.company_id || 1,
        code: item.code || '',
        name: item.name || '',
        start_time: item.start_time ? String(item.start_time).slice(0, 5) : '',
        end_time: item.end_time ? String(item.end_time).slice(0, 5) : '',
        break_start: item.break_start ? String(item.break_start).slice(0, 5) : '',
        break_end: item.break_end ? String(item.break_end).slice(0, 5) : '',
        break_duration_minutes: item.break_duration_minutes ?? 60,
        work_hours: item.work_hours ?? 8,
        is_paid_overtime: item.is_paid_overtime !== false,
        overtime_start_after_minutes: item.overtime_start_after_minutes ?? 0,
        is_active: item.is_active !== false,
      });
    } else {
      setForm({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        is_active: item.is_active !== false,
      });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/${activeSection}/${id}`);
      toast.success(`${activeSectionLabel} deleted successfully`);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to delete ${activeSectionLabel}`);
    }
  };

  const handleRowClick = (item) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(activeSection === 'shifts' ? { ...emptyShiftForm } : { ...emptyForm });
    setModalOpen(true);
  };

  const SectionIcon = sections.find(s => s.id === activeSection)?.icon || BusinessIcon;
  const activeSectionLabel = sections.find(s => s.id === activeSection)?.label || activeSection;
  const columns = sectionColumns[activeSection] || [];

  const detailFields = detailItem
    ? Object.keys(detailItem).filter(k => !EXCLUDE_DETAIL.includes(k))
    : [];

  return (
    <div className="master-data">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Master Data</h1>
          <p>Manage companies, branches, departments and other reference data</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <AddIcon fontSize="small" /> Add New
        </Button>
      </div>

      <div className="master-data-layout">
        <Card className="master-data-nav">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`master-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon fontSize="small" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </Card>

        <Card className="master-data-content">
          <div className="master-data-header">
            <SectionIcon fontSize="small" />
            <h3>{activeSectionLabel}</h3>
          </div>

          <Table
            columns={[
              ...columns,
              { key: '_actions', label: '', width: '80px', render: (_v, row) => (
                <div className="table-actions" onClick={e => e.stopPropagation()}>
                  <button className="table-action-btn" onClick={() => handleEdit(row)} title="Edit">
                    <EditIcon fontSize="small" />
                  </button>
                  <button className="table-action-btn delete" onClick={() => handleDelete(row.id)} title="Delete">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              )},
            ]}
            data={data}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No data found. Click 'Add New' to create."
            maxHeight="480px"
            sticky
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Detail: ${activeSectionLabel}`}>
        {detailItem && (
          <div className="detail-grid">
            {detailFields.map(key => (
              <div key={key} className="detail-row">
                <span className="detail-label">{formatLabel(key)}</span>
                <span className="detail-value">
                  {key === 'is_active' ? (
                    <Badge variant={detailItem[key] ? 'success' : 'muted'}>
                      {detailItem[key] ? 'Active' : 'Inactive'}
                    </Badge>
                  ) : (
                    formatDetailValue(key, detailItem[key])
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleEdit(detailItem); }}>
            <EditIcon fontSize="small" /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
            <CloseIcon fontSize="small" /> Close
          </Button>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${activeSectionLabel}` : `Add ${activeSectionLabel}`}
      >
        <form onSubmit={handleSubmit}>
          {activeSection === 'shifts' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Shift Name</label>
                  <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Work Hours</label>
                  <input type="number" step="0.5" min="0.5" className="form-input" value={form.work_hours} onChange={e => setForm({...form, work_hours: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Break (minutes)</label>
                  <input type="number" min="0" className="form-input" value={form.break_duration_minutes} onChange={e => setForm({...form, break_duration_minutes: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Break Start</label>
                  <input type="time" className="form-input" value={form.break_start} onChange={e => setForm({...form, break_start: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Break End</label>
                  <input type="time" className="form-input" value={form.break_end} onChange={e => setForm({...form, break_end: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Overtime starts after (minutes)</label>
                <input type="number" min="0" className="form-input" value={form.overtime_start_after_minutes} onChange={e => setForm({...form, overtime_start_after_minutes: Number(e.target.value)})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <input type="checkbox" checked={form.is_paid_overtime} onChange={e => setForm({...form, is_paid_overtime: e.target.checked})} />
                    Paid Overtime
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                    Active
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input type="text" className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                  Active
                </label>
              </div>
            </>
          )}
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
