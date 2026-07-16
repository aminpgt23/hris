import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import './Payroll.css';

const Rp = (v) => v != null ? `Rp${Number(v).toLocaleString('id-ID')}` : '-';

const periodStatusBadge = {
  Draft: <Badge variant="neutral">Draft</Badge>,
  Initialized: <Badge variant="info">Initialized</Badge>,
  Processing: <Badge variant="info">Processing</Badge>,
  Simulated: <Badge variant="warning">Simulated</Badge>,
  Approved: <Badge variant="success">Approved</Badge>,
  Paid: <Badge variant="success">Paid</Badge>,
  Closed: <Badge variant="neutral">Closed</Badge>,
};

const tabs = [
  { id: 'periods', label: 'Payroll Periods' },
  { id: 'components', label: 'Salary Components' },
  { id: 'assignments', label: 'Employee Assignments' },
];

const emptyPeriod = { company_id: 1, code: '', name: '', period_type: 'Monthly', payment_day: 25, cutoff_day: 20, fiscal_year: new Date().getFullYear(), period_number: '', start_date: '', end_date: '', payment_date: '' };
const emptyComponent = { company_id: 1, code: '', name: '', type: 'Earning', category: 'Fixed', calculation_type: 'Fixed Amount', formula: '', is_taxable: true, is_pensionable: false, is_bpjs_base: false, display_on_payslip: true, sequence_order: 0, is_active: true };
const emptyAssignment = { employee_id: '', basic_salary: '', tax_category: 'TK0', bpjs_health_percentage: 1.00, bpjs_employment_percentage: 2.00, pension_percentage: 1.00, is_eligible_payroll: true, bank_transfer: true, effective_from: '' };

export default function Payroll() {
  const toast = useToast();
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [components, setComponents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', type: 'period' });
  const [form, setForm] = useState({ ...emptyPeriod });
  const [editingId, setEditingId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const p = api.get('/payroll/periods').then(r => r.data?.data || []);
      const c = api.get('/payroll/salary-components').then(r => r.data?.data || []);
      const a = api.get('/payroll/assignments').then(r => r.data?.data || []);
      const e = api.get('/payroll/employees').then(r => r.data?.data || []);
      const s = api.get('/payroll/summary').then(r => r.data?.data || {}).catch(() => ({}));
      const [periodsData, compData, assignData, empData, sumData] = await Promise.all([p, c, a, e, s]);
      setPeriods(periodsData);
      setComponents(compData);
      setAssignments(assignData);
      setEmployees(empData);
      setSummary(sumData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ---- Modal helpers ----
  const openCreate = (type) => {
    setEditingId(null);
    if (type === 'period') setForm({ ...emptyPeriod });
    else if (type === 'component') setForm({ ...emptyComponent });
    else setForm({ ...emptyAssignment });
    setModal({ open: true, mode: 'create', type });
  };

  const openEdit = (type, item) => {
    setEditingId(item.id);
    const f = { ...item };
    // Ensure boolean fields
    ['is_taxable','is_pensionable','is_bpjs_base','display_on_payslip','is_active','is_eligible_payroll','bank_transfer'].forEach(k => {
      if (k in f) f[k] = !!f[k];
    });
    setForm(f);
    setModal({ open: true, mode: 'edit', type });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', type: 'period' });

  // ---- CRUD Periods ----
  const savePeriod = async (e) => {
    e.preventDefault();
    if (!form.company_id || !form.code || !form.name || !form.fiscal_year || !form.period_number || !form.start_date || !form.end_date) {
      return toast.error('Please fill all required fields');
    }
    try {
      if (editingId) {
        await api.put(`/payroll/periods/${editingId}`, form);
        toast.success('Period updated');
      } else {
        await api.post('/payroll/periods', form);
        toast.success('Period created');
      }
      closeModal(); loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save period'); }
  };

  const deletePeriod = async (id) => {
    try {
      await api.delete(`/payroll/periods/${id}`);
      toast.success('Period deleted');
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  // ---- CRUD Components ----
  const saveComponent = async (e) => {
    e.preventDefault();
    if (!form.company_id || !form.code || !form.name || !form.type || !form.category) {
      return toast.error('Please fill all required fields');
    }
    try {
      if (editingId) {
        await api.put(`/payroll/salary-components/${editingId}`, form);
        toast.success('Component updated');
      } else {
        await api.post('/payroll/salary-components', form);
        toast.success('Component created');
      }
      closeModal(); loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save component'); }
  };

  const deleteComponent = async (id) => {
    try {
      await api.delete(`/payroll/salary-components/${id}`);
      toast.success('Component deleted');
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  // ---- CRUD Assignments ----
  const saveAssignment = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.basic_salary || !form.effective_from) {
      return toast.error('Please fill all required fields');
    }
    try {
      if (editingId) {
        await api.put(`/payroll/assignments/${editingId}`, form);
        toast.success('Assignment updated');
      } else {
        await api.post('/payroll/assignments', form);
        toast.success('Assignment created');
      }
      closeModal(); loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save assignment'); }
  };

  const deleteAssignment = async (id) => {
    try {
      await api.delete(`/payroll/assignments/${id}`);
      toast.success('Assignment deleted');
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  // ---- Table column defs ----
  const periodColumns = [
    { key: 'code', label: 'Code', width: '80px' },
    { key: 'name', label: 'Period' },
    { key: 'period_type', label: 'Type', width: '80px' },
    { key: 'fiscal_year', label: 'Year', width: '60px' },
    { key: 'period_number', label: '#', width: '50px' },
    { key: 'start_date', label: 'Start', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'end_date', label: 'End', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (v) => periodStatusBadge[v] || v },
    { key: 'total_gross', label: 'Gross', render: (v) => Rp(v) },
    { key: 'total_net', label: 'Net', render: (v) => Rp(v) },
    { key: 'id', label: '', width: '80px',
      render: (v, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="tbl-action" onClick={() => openEdit('period', r)} title="Edit"><EditIcon fontSize="small" /></button>
          <button className="tbl-action danger" onClick={() => deletePeriod(v)} title="Delete"><DeleteIcon fontSize="small" /></button>
        </div>
      ),
    },
  ];

  const componentColumns = [
    { key: 'code', label: 'Code', width: '80px' },
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={v === 'Earning' ? 'success' : v === 'Deduction' ? 'warning' : v === 'Tax' ? 'danger' : 'info'}>{v}</Badge> },
    { key: 'category', label: 'Category' },
    { key: 'calculation_type', label: 'Calc Type' },
    { key: 'is_taxable', label: 'Taxable', render: (v) => v ? 'Yes' : 'No', width: '60px' },
    { key: 'sequence_order', label: 'Seq', width: '40px' },
    { key: 'is_active', label: 'Active', render: (v) => v ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">No</Badge>, width: '70px' },
    { key: 'id', label: '', width: '80px',
      render: (v, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="tbl-action" onClick={() => openEdit('component', r)} title="Edit"><EditIcon fontSize="small" /></button>
          <button className="tbl-action danger" onClick={() => deleteComponent(v)} title="Delete"><DeleteIcon fontSize="small" /></button>
        </div>
      ),
    },
  ];

  const assignmentColumns = [
    { key: 'employee_number', label: 'Emp #', width: '90px' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'department_name', label: 'Department', render: (v) => v || '-' },
    { key: 'basic_salary', label: 'Basic Salary', render: (v) => Rp(v) },
    { key: 'tax_category', label: 'Tax', width: '50px' },
    { key: 'bpjs_health_percentage', label: 'BPJS Health', render: (v) => v ? `${v}%` : '-', width: '90px' },
    { key: 'is_eligible_payroll', label: 'Eligible', render: (v) => v ? <Badge variant="success">Yes</Badge> : <Badge variant="neutral">No</Badge>, width: '70px' },
    { key: 'effective_from', label: 'Effective', render: (v) => v ? new Date(v).toLocaleDateString() : '-', width: '90px' },
    { key: 'id', label: '', width: '80px',
      render: (v, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="tbl-action" onClick={() => openEdit('assignment', r)} title="Edit"><EditIcon fontSize="small" /></button>
          <button className="tbl-action danger" onClick={() => deleteAssignment(v)} title="Delete"><DeleteIcon fontSize="small" /></button>
        </div>
      ),
    },
  ];

  // ---- Render modals ----
  const renderModal = () => {
    if (!modal.open) return null;
    const { type, mode } = modal;
    const isEdit = mode === 'edit';
    const titles = { period: `${isEdit ? 'Edit' : 'Create'} Payroll Period`, component: `${isEdit ? 'Edit' : 'Create'} Salary Component`, assignment: `${isEdit ? 'Edit' : 'Create'} Salary Assignment` };
    const handleSubmit = type === 'period' ? savePeriod : type === 'component' ? saveComponent : saveAssignment;

    return (
      <Modal open={modal.open} onClose={closeModal} title={titles[type]} size="lg"
        footer={<><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button variant="primary" type="submit" form="payroll-form">Save</Button></>}>
        <form id="payroll-form" onSubmit={handleSubmit}>
          {type === 'period' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company ID</label>
                  <input type="number" className="form-input" value={form.company_id} onChange={e => setForm({...form, company_id: +e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Period Type</label>
                  <select className="form-input" value={form.period_type} onChange={e => setForm({...form, period_type: e.target.value})}>
                    <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option><option>Daily</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Year</label>
                  <input type="number" className="form-input" value={form.fiscal_year} onChange={e => setForm({...form, fiscal_year: +e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Period #</label>
                  <input type="number" className="form-input" value={form.period_number} onChange={e => setForm({...form, period_number: +e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Day</label>
                  <input type="number" className="form-input" value={form.payment_day} onChange={e => setForm({...form, payment_day: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cutoff Day</label>
                  <input type="number" className="form-input" value={form.cutoff_day} onChange={e => setForm({...form, cutoff_day: +e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <input type="date" className="form-input" value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} />
                </div>
              </div>
            </>
          )}

          {type === 'component' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                    <option>Earning</option><option>Deduction</option><option>Tax</option><option>Benefit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option>Fixed</option><option>Variable</option><option>Reimbursement</option><option>Loan</option><option>Tax</option><option>BPJS</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Calculation Type</label>
                  <select className="form-input" value={form.calculation_type} onChange={e => setForm({...form, calculation_type: e.target.value})}>
                    <option>Fixed Amount</option><option>Percentage of Basic</option><option>Percentage of Gross</option><option>Formula</option><option>Tiered</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sequence Order</label>
                  <input type="number" className="form-input" value={form.sequence_order} onChange={e => setForm({...form, sequence_order: +e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Formula</label>
                <textarea className="form-input" rows="2" value={form.formula} onChange={e => setForm({...form, formula: e.target.value})} placeholder="Optional formula expression" />
              </div>
              <div className="form-row">
                <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.is_taxable} onChange={e => setForm({...form, is_taxable: e.target.checked})} /> Taxable</label>
                <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.is_pensionable} onChange={e => setForm({...form, is_pensionable: e.target.checked})} /> Pensionable</label>
                <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.is_bpjs_base} onChange={e => setForm({...form, is_bpjs_base: e.target.checked})} /> BPJS Base</label>
                <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.display_on_payslip} onChange={e => setForm({...form, display_on_payslip: e.target.checked})} /> Show on Payslip</label>
                <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
              </div>
            </>
          )}

          {type === 'assignment' && (
            <>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Employee</label>
                  <select className="form-input" value={form.employee_id} onChange={e => setForm({...form, employee_id: +e.target.value})} required>
                    <option value="">Select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.employee_number} - {emp.employee_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Basic Salary (Rp)</label>
                  <input type="number" className="form-input" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tax Category</label>
                  <select className="form-input" value={form.tax_category} onChange={e => setForm({...form, tax_category: e.target.value})}>
                    <option>TK0</option><option>TK1</option><option>TK2</option><option>TK3</option>
                    <option>K0</option><option>K1</option><option>K2</option><option>K3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">BPJS Health (%)</label>
                  <input type="number" step="0.01" className="form-input" value={form.bpjs_health_percentage} onChange={e => setForm({...form, bpjs_health_percentage: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">BPJS Employment (%)</label>
                  <input type="number" step="0.01" className="form-input" value={form.bpjs_employment_percentage} onChange={e => setForm({...form, bpjs_employment_percentage: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pension (%)</label>
                  <input type="number" step="0.01" className="form-input" value={form.pension_percentage} onChange={e => setForm({...form, pension_percentage: +e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Effective From</label>
                  <input type="date" className="form-input" value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})} required />
                </div>
                <div className="form-group flex items-center gap-4" style={{ paddingTop: '22px' }}>
                  <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.is_eligible_payroll} onChange={e => setForm({...form, is_eligible_payroll: e.target.checked})} /> Eligible Payroll</label>
                  <label className="form-label flex items-center gap-2"><input type="checkbox" checked={form.bank_transfer} onChange={e => setForm({...form, bank_transfer: e.target.checked})} /> Bank Transfer</label>
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>
    );
  };

  const activeData = tab === 'periods' ? periods : tab === 'components' ? components : assignments;
  const activeColumns = tab === 'periods' ? periodColumns : tab === 'components' ? componentColumns : assignmentColumns;

  return (
    <div>
      {renderModal()}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Payroll Master</h1>
          <p>Manage payroll periods, salary components, and employee assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => openCreate(tab === 'periods' ? 'period' : tab === 'components' ? 'component' : 'assignment')}>
            <AddIcon fontSize="small" /> Add {tab === 'periods' ? 'Period' : tab === 'components' ? 'Component' : 'Assignment'}
          </Button>
          <Button variant="ghost" size="sm" onClick={loadAll}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card className="pr-summary">
          <div className="pr-summary-label">Total Employees</div>
          <div className="pr-summary-value">{summary?.totalEmployees ?? '-'}</div>
          <div className="pr-summary-trend">Active payroll</div>
        </Card>
        <Card className="pr-summary">
          <div className="pr-summary-label">Total Payroll (Net)</div>
          <div className="pr-summary-value">{summary?.totalPayroll ? Rp(summary.totalPayroll) : '-'}</div>
          <div className="pr-summary-trend">All time</div>
        </Card>
        <Card className="pr-summary">
          <div className="pr-summary-label">Active Periods</div>
          <div className="pr-summary-value">{summary?.activePeriods ?? '-'}</div>
          <div className="pr-summary-trend">Requires processing</div>
        </Card>
        <Card className="pr-summary">
          <div className="pr-summary-label">Components</div>
          <div className="pr-summary-value">{components.length}</div>
          <div className="pr-summary-trend">Salary components</div>
        </Card>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-4)' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <Card>
        <Table columns={activeColumns} data={activeData} loading={loading}
          emptyMessage={`No ${tab === 'periods' ? 'payroll periods' : tab === 'components' ? 'salary components' : 'employee assignments'} found.`}
          sticky maxHeight="480px" />
      </Card>
    </div>
  );
}
