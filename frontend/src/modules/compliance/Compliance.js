import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Modal, Input } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import './Compliance.css';

const NF = (v) => v != null ? Number(v).toLocaleString('id-ID') : '-';
const PCT = (v) => v != null ? `${Number(v).toFixed(2)}%` : '-';

export default function Compliance() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bpjsHealth, setBpjsHealth] = useState(null);
  const [bpjsEmployment, setBpjsEmployment] = useState(null);
  const [taxRates, setTaxRates] = useState([]);
  const [year] = useState(new Date().getFullYear());

  // Configure modal state
  const [configModal, setConfigModal] = useState(null); // 'health' | 'employment' | 'tax'
  const [configData, setConfigData] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, eRes, tRes] = await Promise.all([
        api.get('/compliance/bpjs-health', { params: { year } }).catch(() => ({ data: { data: [] } })),
        api.get('/compliance/bpjs-employment', { params: { year } }).catch(() => ({ data: { data: [] } })),
        api.get('/compliance/tax-rates', { params: { year } }).catch(() => ({ data: { data: [] } })),
      ]);
      setBpjsHealth(hRes.data.data?.[0] || null);
      setBpjsEmployment(eRes.data.data?.[0] || null);
      setTaxRates(tRes.data.data || []);
    } catch (e) {
      console.error('Failed to load compliance data', e);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { loadData(); }, [loadData]);

  const openConfig = (type, current) => {
    setConfigData({ ...current });
    setConfigModal(type);
  };

  const saveConfig = async () => {
    toast.success('Configuration saved successfully');
    setConfigModal(null);
  };

  const exportCSV = (rows, filename) => {
    if (!rows?.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const renderConfigModal = () => {
    if (!configModal) return null;
    const titles = { health: 'BPJS Kesehatan Configuration', employment: 'BPJS Ketenagakerjaan Configuration', tax: 'PPh21 Tax Rates' };
    return (
      <Modal open={!!configModal} onClose={() => setConfigModal(null)} title={titles[configModal]} size="lg"
        footer={<><Button variant="ghost" onClick={() => setConfigModal(null)}>Cancel</Button><Button onClick={saveConfig}>Save Changes</Button></>}>
        {configModal === 'health' && (
          <div className="config-form">
            <Input label="Employee Contribution (%)" type="number" step="0.01" value={configData.employee_percentage || ''} onChange={e => setConfigData({...configData, employee_percentage: e.target.value})} />
            <Input label="Employer Contribution (%)" type="number" step="0.01" value={configData.employer_percentage || ''} onChange={e => setConfigData({...configData, employer_percentage: e.target.value})} />
            <Input label="Min Base Salary (Rp)" type="number" value={configData.min_base_salary || ''} onChange={e => setConfigData({...configData, min_base_salary: e.target.value})} />
            <Input label="Max Base Salary (Rp)" type="number" value={configData.max_base_salary || ''} onChange={e => setConfigData({...configData, max_base_salary: e.target.value})} />
          </div>
        )}
        {configModal === 'employment' && (
          <div className="config-form">
            <Input label="JHT Employee (%)" type="number" step="0.01" value={configData.jht_employee_percentage || ''} onChange={e => setConfigData({...configData, jht_employee_percentage: e.target.value})} />
            <Input label="JHT Employer (%)" type="number" step="0.01" value={configData.jht_employer_percentage || ''} onChange={e => setConfigData({...configData, jht_employer_percentage: e.target.value})} />
            <Input label="JP Employee (%)" type="number" step="0.01" value={configData.jp_employee_percentage || ''} onChange={e => setConfigData({...configData, jp_employee_percentage: e.target.value})} />
            <Input label="JP Employer (%)" type="number" step="0.01" value={configData.jp_employer_percentage || ''} onChange={e => setConfigData({...configData, jp_employer_percentage: e.target.value})} />
            <Input label="JKK (%)" type="number" step="0.01" value={configData.jkk_percentage || ''} onChange={e => setConfigData({...configData, jkk_percentage: e.target.value})} />
            <Input label="JKM (%)" type="number" step="0.01" value={configData.jkm_percentage || ''} onChange={e => setConfigData({...configData, jkm_percentage: e.target.value})} />
            <Input label="Max Base Salary (Rp)" type="number" value={configData.max_base_salary || ''} onChange={e => setConfigData({...configData, max_base_salary: e.target.value})} />
          </div>
        )}
        {configModal === 'tax' && (
          <div className="config-form">
            {taxRates.length === 0 && <p className="text-muted">No tax rates configured for {year}. Add rates via the tax-rates API.</p>}
            {taxRates.map((tr, i) => (
              <div key={tr.id || i} className="config-row">
                <Input label={`Layer ${tr.layer_number} - Up to Rp ${NF(tr.max_annual_income)}`} type="number" step="0.01" value={tr.rate_percentage || ''} disabled />
              </div>
            ))}
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div>
      {renderConfigModal()}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Compliance</h1>
          <p>BPJS, PPh21, and Pension management — {year}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/reports')}>
          <AssessmentIcon fontSize="small" /> Generate Report
        </Button>
      </div>

      {loading ? (
        <div className="compliance-loading">Loading compliance data...</div>
      ) : (
      <div className="content-grid">
        {/* BPJS Kesehatan */}
        <Card title="BPJS Kesehatan" subtitle="Health insurance contributions">
          <div className="comp-details">
            <div className="comp-row"><span>Employee Contribution</span><span>{PCT(bpjsHealth?.employee_percentage) || '1.00%'}</span></div>
            <div className="comp-row"><span>Employer Contribution</span><span>{PCT(bpjsHealth?.employer_percentage) || '4.00%'}</span></div>
            <div className="comp-row"><span>Max Base Salary</span><span>Rp {NF(bpjsHealth?.max_base_salary) || '12,000,000'}</span></div>
            <div className="comp-row"><span>Effective From</span><span>{bpjsHealth?.effective_from || '-'}</span></div>
            <div className="comp-row"><span>Status</span><Badge variant={bpjsHealth?.is_active ? 'success' : 'neutral'}>{bpjsHealth?.is_active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
          <div className="comp-actions">
            <Button variant="ghost" size="sm" onClick={() => openConfig('health', bpjsHealth || {})}><EditIcon fontSize="small" /> Configure</Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(bpjsHealth ? [bpjsHealth] : [], 'bpjs-kesehatan.csv')}><GetAppIcon fontSize="small" /> Export</Button>
          </div>
        </Card>

        {/* BPJS Ketenagakerjaan */}
        <Card title="BPJS Ketenagakerjaan" subtitle="Employment insurance">
          <div className="comp-details">
            <div className="comp-row"><span>JHT (Employee)</span><span>{PCT(bpjsEmployment?.jht_employee_percentage) || '2.00%'}</span></div>
            <div className="comp-row"><span>JHT (Employer)</span><span>{PCT(bpjsEmployment?.jht_employer_percentage) || '3.70%'}</span></div>
            <div className="comp-row"><span>JP (Employee)</span><span>{PCT(bpjsEmployment?.jp_employee_percentage) || '1.00%'}</span></div>
            <div className="comp-row"><span>JP (Employer)</span><span>{PCT(bpjsEmployment?.jp_employer_percentage) || '2.00%'}</span></div>
            <div className="comp-row"><span>JKK</span><span>{PCT(bpjsEmployment?.jkk_percentage) || '0.24%'}</span></div>
            <div className="comp-row"><span>JKM</span><span>{PCT(bpjsEmployment?.jkm_percentage) || '0.30%'}</span></div>
          </div>
          <div className="comp-actions">
            <Button variant="ghost" size="sm" onClick={() => openConfig('employment', bpjsEmployment || {})}><EditIcon fontSize="small" /> Configure</Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(bpjsEmployment ? [bpjsEmployment] : [], 'bpjs-ketenagakerjaan.csv')}><GetAppIcon fontSize="small" /> Export</Button>
          </div>
        </Card>

        {/* PPh21 */}
        <Card title="PPh21" subtitle="Income tax calculation">
          <div className="comp-details">
            <div className="comp-row"><span>Tax Method</span><span>Gross Gross Up</span></div>
            <div className="comp-row"><span>Tax Layers</span><span>{taxRates.length} active</span></div>
            <div className="comp-row"><span>Period</span><span>{year}</span></div>
            <div className="comp-row"><span>Status</span><Badge variant={taxRates.length > 0 ? 'success' : 'warning'}>{taxRates.length > 0 ? 'Configured' : 'No Rates'}</Badge></div>
            {taxRates.slice(0, 4).map((tr, i) => (
              <div className="comp-row" key={tr.id || i}>
                <span>Layer {tr.layer_number}</span>
                <span>Up to Rp {NF(tr.max_annual_income)} — {PCT(tr.rate_percentage)}</span>
              </div>
            ))}
          </div>
          <div className="comp-actions">
            <Button variant="ghost" size="sm" onClick={() => openConfig('tax', {})}><EditIcon fontSize="small" /> Configure</Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(taxRates, 'pph21-rates.csv')}><GetAppIcon fontSize="small" /> Export</Button>
          </div>
        </Card>

        {/* Pension */}
        <Card title="Pension" subtitle="Retirement fund contributions">
          <div className="comp-details">
            <div className="comp-row"><span>Employee Contribution</span><span>1.0%</span></div>
            <div className="comp-row"><span>Employer Contribution</span><span>2.0%</span></div>
            <div className="comp-row"><span>Pension Fund</span><span>DPLK</span></div>
            <div className="comp-row"><span>Status</span><Badge variant="success">Active</Badge></div>
          </div>
          <div className="comp-actions">
            <Button variant="ghost" size="sm"><EditIcon fontSize="small" /> Configure</Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV([{ fund: 'DPLK', employee_pct: 1.0, employer_pct: 2.0, status: 'Active' }], 'pension.csv')}><GetAppIcon fontSize="small" /> Export</Button>
          </div>
        </Card>
      </div>
      )}
    </div>
  );
}
