import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import './Asset.css';

const statusBadge = {
  New: <Badge variant="success">New</Badge>,
  Good: <Badge variant="info">Good</Badge>,
  Fair: <Badge variant="warning">Fair</Badge>,
  Poor: <Badge variant="danger">Poor</Badge>,
};

export default function AssetManagement() {
  const toast = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    company_id: 1, asset_category_id: 1, name: '', asset_number: '',
    serial_number: '', purchase_date: '', purchase_cost: '', vendor_name: '', condition: 'New',
  });

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assets', { params: { search, limit: 50 } });
      setAssets(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAssets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', form);
      setModalOpen(false);
      setForm({ company_id: 1, asset_category_id: 1, name: '', asset_number: '', serial_number: '', purchase_date: '', purchase_cost: '', vendor_name: '', condition: 'New' });
      toast.success('Asset created successfully');
      loadAssets();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create asset');
    }
  };

  const handleSearch = () => { loadAssets(); };

  const stats = {
    total: assets.length,
    available: assets.filter(a => a.condition === 'New' || a.condition === 'Good').length,
    assigned: assets.filter(a => a.assigned_to_employee_id).length,
    maintenance: assets.filter(a => a.condition === 'Poor').length,
  };

  const columns = [
    { key: 'asset_number', label: 'Asset #', width: '110px' },
    { key: 'name', label: 'Name' },
    { key: 'category_name', label: 'Category', render: (v) => v || '-' },
    { key: 'assigned_to_name', label: 'Assigned To', render: (v) => v || '-' },
    { key: 'condition', label: 'Condition', render: (v) => statusBadge[v] || v || '-' },
    { key: 'purchase_date', label: 'Purchase', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'purchase_cost', label: 'Cost', render: (v) => v ? `Rp${Number(v).toLocaleString()}` : '-' },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Asset Management</h1>
          <p>Track company assets and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><AddIcon fontSize="small" /> Add Asset</Button>
          <Button variant="ghost" size="sm" onClick={loadAssets}><RefreshIcon fontSize="small" /></Button>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="ast-stat"><div className="ast-stat-value" style={{ color: 'var(--color-primary)' }}>{stats.total}</div><div className="ast-stat-label">Total Assets</div></Card>
        <Card className="ast-stat"><div className="ast-stat-value" style={{ color: 'var(--color-success)' }}>{stats.available}</div><div className="ast-stat-label">Available</div></Card>
        <Card className="ast-stat"><div className="ast-stat-value" style={{ color: 'var(--color-info)' }}>{stats.assigned}</div><div className="ast-stat-label">Assigned</div></Card>
        <Card className="ast-stat"><div className="ast-stat-value" style={{ color: 'var(--color-warning)' }}>{stats.maintenance}</div><div className="ast-stat-label">Maintenance</div></Card>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="search-field">
            <span className="search-icon"><SearchIcon fontSize="small" /></span>
            <input type="text" placeholder="Search assets..." className="table-search-input"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <Table columns={columns} data={assets} loading={loading} emptyMessage="No assets found" sticky maxHeight="440px" />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Asset">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Asset Number</label>
              <input type="text" className="form-input" value={form.asset_number}
                onChange={e => setForm({...form, asset_number: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category ID</label>
              <input type="number" className="form-input" value={form.asset_category_id}
                onChange={e => setForm({...form, asset_category_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-input" value={form.condition}
                onChange={e => setForm({...form, condition: e.target.value})}>
                <option>New</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input type="date" className="form-input" value={form.purchase_date}
                onChange={e => setForm({...form, purchase_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Cost (IDR)</label>
              <input type="number" className="form-input" value={form.purchase_cost}
                onChange={e => setForm({...form, purchase_cost: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Serial Number</label>
            <input type="text" className="form-input" value={form.serial_number}
              onChange={e => setForm({...form, serial_number: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <input type="text" className="form-input" value={form.vendor_name}
              onChange={e => setForm({...form, vendor_name: e.target.value})} />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Asset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
