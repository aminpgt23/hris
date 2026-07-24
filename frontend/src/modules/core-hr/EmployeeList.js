import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './CoreHR.css';

const statusOptions = ['Permanent', 'Contract', 'Probation', 'Intern', 'Resigned', 'Terminated'];
const genderOptions = ['Male', 'Female'];
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

const statusBadge = {
  Permanent: <Badge variant="success">Permanent</Badge>,
  Contract: <Badge variant="info">Contract</Badge>,
  Probation: <Badge variant="warning">Probation</Badge>,
  Intern: <Badge variant="neutral">Intern</Badge>,
  Resigned: <Badge variant="danger">Resigned</Badge>,
  Terminated: <Badge variant="danger">Terminated</Badge>,
};

const initialForm = {
  employee_number: '', first_name: '', last_name: '', gender: 'Male',
  employment_status: 'Permanent', hire_date: '', email_company: '', phone_personal: '',
  department_id: '', position_id: '', marital_status: 'Single', religion: '',
  id_card_number: '', npwp: '', bpjs_health_number: '', bpjs_employment_number: '',
  address_current: '', city: '', province: '',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().split('T')[0];
}

export default function EmployeeList() {
  const { user } = useAuth();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/core-hr/employees', { params: { search, limit: 100 } });
      setEmployees(res.data?.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await api.get('/core-hr/departments');
      setDepartments(res.data?.data || []);
    } catch {}
  }, []);

  const loadPositions = useCallback(async () => {
    try {
      const res = await api.get('/core-hr/positions');
      setPositions(res.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);
  useEffect(() => { if (!search) loadEmployees(); }, [search, loadEmployees]);
  useEffect(() => { loadDepartments(); loadPositions(); }, [loadDepartments, loadPositions]);

  const handleSearch = () => { loadEmployees(); };

  const openAdd = () => {
    setForm({ ...initialForm, company_id: user?.company_id || 1 });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (emp) => {
    setForm({
      employee_number: emp.employee_number || '',
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      gender: emp.gender || 'Male',
      employment_status: emp.employment_status || 'Permanent',
      hire_date: formatDate(emp.hire_date),
      email_company: emp.email_company || '',
      phone_personal: emp.phone_personal || '',
      department_id: emp.department_id ? String(emp.department_id) : '',
      position_id: emp.position_id ? String(emp.position_id) : '',
      marital_status: emp.marital_status || 'Single',
      religion: emp.religion || '',
      id_card_number: emp.id_card_number || '',
      npwp: emp.npwp || '',
      bpjs_health_number: emp.bpjs_health_number || '',
      bpjs_employment_number: emp.bpjs_employment_number || '',
      address_current: emp.address_current || '',
      city: emp.city || '',
      province: emp.province || '',
      company_id: emp.company_id || user?.company_id || 1,
    });
    setEditingId(emp.id);
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.employee_number || !form.first_name || !form.gender || !form.employment_status || !form.hire_date) {
      toast.error('Please fill required fields: Employee #, First Name, Gender, Status, Hire Date');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.department_id) payload.department_id = Number(payload.department_id);
      if (payload.position_id) payload.position_id = Number(payload.position_id);
      if (payload.company_id) payload.company_id = Number(payload.company_id);

      if (editingId) {
        await api.put(`/core-hr/employees/${editingId}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/core-hr/employees', payload);
        toast.success('Employee created successfully');
      }
      setFormOpen(false);
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (emp) => {
    setDeleteTarget(emp);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/core-hr/employees/${deleteTarget.id}`);
      toast.success('Employee deactivated successfully');
      setConfirmOpen(false);
      setDeleteTarget(null);
      if (detailItem?.id === deleteTarget.id) {
        setDetailOpen(false);
        setDetailItem(null);
      }
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleRowClick = (employee) => {
    setDetailItem(employee);
    setDetailOpen(true);
  };

  const columns = [
    { key: 'employee_number', label: 'Emp #', width: '100px' },
    { key: 'full_name', label: 'Full Name', render: (v, r) => v || `${r.first_name || ''} ${r.last_name || ''}`.trim() || '-' },
    { key: 'department_name', label: 'Department', render: (v) => v || '-' },
    { key: 'position_name', label: 'Position', render: (v) => v || '-' },
    { key: 'employment_status', label: 'Status', render: (v) => statusBadge[v] || v || '-' },
    {
      key: 'actions', label: '', width: '80px', render: (_, row) => (
        <span style={{ display: 'inline-flex', gap: '4px' }}>
          <button className="action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <EditIcon fontSize="small" />
          </button>
          <button className="action-btn danger" title="Deactivate" onClick={(e) => { e.stopPropagation(); openDelete(row); }}>
            <DeleteIcon fontSize="small" />
          </button>
        </span>
      ),
    },
  ];

  const detailFields = detailItem
    ? Object.keys(detailItem).filter(k => !['id', 'created_at', 'updated_at', 'deleted_at', 'password_hash'].includes(k))
    : [];

  function formatLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function formatValue(key, value) {
    if (value === null || value === undefined) return '-';
    if (key === 'is_active') return value ? 'Active' : 'Inactive';
    if (key.includes('date') || key === 'created_at' || key === 'updated_at') {
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(value).toLocaleDateString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  }

  const isAdminOrHR = user?.roleName === 'Administrator' || user?.roleName === 'HR Staff';

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Employees</h1>
          <p>Manage employee master data</p>
        </div>
        <div className="flex gap-2">
          {isAdminOrHR && (
            <Button variant="primary" size="sm" onClick={openAdd}>
              <AddIcon fontSize="small" /> Add Employee
            </Button>
          )}
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

      {/* Create / Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Employee Number *</label>
              <input className="form-input" name="employee_number" value={form.employee_number} onChange={handleFormChange} placeholder="e.g. EMP001" required />
            </div>
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input className="form-input" name="first_name" value={form.first_name} onChange={handleFormChange} placeholder="First name" required />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="last_name" value={form.last_name} onChange={handleFormChange} placeholder="Last name" />
            </div>
            <div className="form-field">
              <label className="form-label">Gender *</label>
              <select className="form-select" name="gender" value={form.gender} onChange={handleFormChange}>
                {genderOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Department</label>
              <select className="form-select" name="department_id" value={form.department_id} onChange={handleFormChange}>
                <option value="">-- Select --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Position</label>
              <select className="form-select" name="position_id" value={form.position_id} onChange={handleFormChange}>
                <option value="">-- Select --</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Employment Status *</label>
              <select className="form-select" name="employment_status" value={form.employment_status} onChange={handleFormChange}>
                {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Hire Date *</label>
              <input className="form-input" type="date" name="hire_date" value={form.hire_date} onChange={handleFormChange} required />
            </div>
            <div className="form-field">
              <label className="form-label">Email (Company)</label>
              <input className="form-input" type="email" name="email_company" value={form.email_company} onChange={handleFormChange} placeholder="email@company.com" />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone_personal" value={form.phone_personal} onChange={handleFormChange} placeholder="Phone number" />
            </div>
            <div className="form-field">
              <label className="form-label">Marital Status</label>
              <select className="form-select" name="marital_status" value={form.marital_status} onChange={handleFormChange}>
                {maritalOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Religion</label>
              <input className="form-input" name="religion" value={form.religion} onChange={handleFormChange} placeholder="Religion" />
            </div>
            <div className="form-field">
              <label className="form-label">ID Card Number</label>
              <input className="form-input" name="id_card_number" value={form.id_card_number} onChange={handleFormChange} placeholder="KTP / National ID" />
            </div>
            <div className="form-field">
              <label className="form-label">NPWP</label>
              <input className="form-input" name="npwp" value={form.npwp} onChange={handleFormChange} placeholder="Tax ID" />
            </div>
            <div className="form-field">
              <label className="form-label">BPJS Health</label>
              <input className="form-input" name="bpjs_health_number" value={form.bpjs_health_number} onChange={handleFormChange} placeholder="BPJS Kesehatan" />
            </div>
            <div className="form-field">
              <label className="form-label">BPJS Employment</label>
              <input className="form-input" name="bpjs_employment_number" value={form.bpjs_employment_number} onChange={handleFormChange} placeholder="BPJS Ketenagakerjaan" />
            </div>
            <div className="form-field full-width">
              <label className="form-label">Address</label>
              <input className="form-input" name="address_current" value={form.address_current} onChange={handleFormChange} placeholder="Current address" />
            </div>
            <div className="form-field">
              <label className="form-label">City</label>
              <input className="form-input" name="city" value={form.city} onChange={handleFormChange} placeholder="City" />
            </div>
            <div className="form-field">
              <label className="form-label">Province</label>
              <input className="form-input" name="province" value={form.province} onChange={handleFormChange} placeholder="Province" />
            </div>
          </div>
          <div className="form-actions">
            <Button variant="ghost" size="sm" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Employee: ${detailItem?.full_name || detailItem?.employee_number || ''}`} size="lg">
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
          {isAdminOrHR && (
            <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}>
              <EditIcon fontSize="small" /> Edit
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
            <CloseIcon fontSize="small" /> Close
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={confirmOpen} onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }} title="Confirm Deactivation" size="sm">
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to deactivate <strong>{deleteTarget?.full_name || deleteTarget?.employee_number}</strong>?
          This will mark them as inactive and they will no longer appear in active employee lists.
        </p>
        <div className="modal-actions">
          <Button variant="ghost" size="sm" onClick={() => { setConfirmOpen(false); setDeleteTarget(null); }}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Deactivate</Button>
        </div>
      </Modal>
    </div>
  );
}