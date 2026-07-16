import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import Table from '../../components/ui/Table';
import { HRISBarChart, CHART_COLORS } from '../../components/charts';
import api from '../../services/api';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import AlarmIcon from '@mui/icons-material/Alarm';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import './Reports.css';

const reportTypes = [
  { id: 'employee-summary', name: 'Employee Summary', desc: 'Complete employee list with demographics', icon: PeopleIcon, format: 'PDF', endpoint: '/reports/generate/employee-summary' },
  { id: 'payroll-summary', name: 'Payroll Summary', desc: 'Payroll cost breakdown by period', icon: AccountBalanceWalletIcon, format: 'Excel', endpoint: '/reports/generate/payroll-summary' },
  { id: 'attendance', name: 'Attendance Report', desc: 'Monthly attendance and tardiness', icon: AccessTimeIcon, format: 'PDF', endpoint: '/reports/generate/attendance' },
  { id: 'leave-analysis', name: 'Leave Analysis', desc: 'Leave usage patterns and balances', icon: BeachAccessIcon, format: 'Excel', endpoint: '/reports/generate/leave-analysis' },
  { id: 'headcount', name: 'Headcount Report', desc: 'Department-wise headcount analysis', icon: BarChartIcon, format: 'PDF', endpoint: '/reports/generate/headcount' },
  { id: 'bpjs', name: 'BPJS Report', desc: 'BPJS contribution summary', icon: GavelIcon, format: 'CSV', endpoint: '/reports/generate/bpjs' },
  { id: 'pph21', name: 'PPh21 Report', desc: 'Tax calculation and withholding', icon: DescriptionIcon, format: 'Excel', endpoint: '/reports/generate/pph21' },
  { id: 'overtime', name: 'Overtime Report', desc: 'Overtime costs by department', icon: AlarmIcon, format: 'Excel', endpoint: '/reports/generate/overtime' },
];

const formatIcon = {
  PDF: <PictureAsPdfIcon fontSize="small" />,
  Excel: <TableChartIcon fontSize="small" />,
  CSV: <InsertDriveFileIcon fontSize="small" />,
};

export default function Reports() {
  const [view, setView] = useState('list');
  const [activeReport, setActiveReport] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), department_id: '', period_id: '', status: '' });

  const generateReport = async (report) => {
    setActiveReport(report);
    setLoading(true);
    setResult(null);
    try {
      const params = { ...filters };
      if (report.id === 'attendance' || report.id === 'overtime') {
        params.month = filters.month;
        params.year = filters.year;
      }
      if (report.id === 'leave-analysis' || report.id === 'pph21') {
        params.year = filters.year;
      }
      const res = await api.get(report.endpoint, { params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '')) });
      setResult(res.data);
      setView('result');
    } catch (e) {
      setResult({ success: false, message: e.response?.data?.message || 'Failed to generate report' });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result?.data?.length) return;
    const rows = result.data;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeReport?.id || 'report'}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (v) => {
    if (v === null || v === undefined) return '-';
    return `Rp${Number(v).toLocaleString('id-ID')}`;
  };

  const buildColumns = (data) => {
    if (!data?.length) return [];
    return Object.keys(data[0]).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      render: (v) => {
        if (v === null || v === undefined) return '-';
        if (typeof v === 'number') {
          if (key.includes('salary') || key.includes('gross') || key.includes('net') || key.includes('cost') || key.includes('contribution') || key.includes('tax') || key.includes('amount') || key.includes('deduction') || key.includes('income') || key.includes('allowance') || key.includes('paid')) {
            return formatCurrency(v);
          }
          return v.toLocaleString();
        }
        return v;
      },
    }));
  };

  const renderResult = () => {
    if (loading) return <Card><div className="report-loading">Generating report...</div></Card>;
    if (!result) return null;

    if (!result.success && result.success !== undefined) {
      return <Card><div className="report-error">{result.message}</div></Card>;
    }

    const data = result.data || [];
    const columns = buildColumns(data);

    return (
      <>
        <div className="report-result-header">
          <div>
            <h2>{activeReport?.name}</h2>
            <p>{data.length} records found</p>
          </div>
          <div className="report-result-actions">
            {activeReport?.id === 'payroll-summary' && result.total_gross && (
              <Card title="Total" style={{ margin: 0 }}>
                <div className="report-summary-stats">
                  <div>Gross: {formatCurrency(result.total_gross)}</div>
                  <div>Net: {formatCurrency(result.total_net)}</div>
                </div>
              </Card>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV}><GetAppIcon fontSize="small" /> Export CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => setView('list')}><CloseIcon fontSize="small" /></Button>
          </div>
        </div>
        <Card>
          <Table columns={columns} data={data} sticky maxHeight="480px" />
        </Card>
      </>
    );
  };

  if (view === 'result') {
    return (
      <div>
        <div className="page-header">
          <h1>Reports</h1>
          <p>Generate and export system reports</p>
        </div>
        {renderResult()}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Generate and export system reports</p>
      </div>

      <Card title="Monthly Payroll Trend" subtitle="Net salary (IDR)">
        <HRISBarChart
          data={[
            { month: 'Feb', amount: 3200000000 },
            { month: 'Mar', amount: 3350000000 },
            { month: 'Apr', amount: 3650000000 },
            { month: 'May', amount: 3700000000 },
            { month: 'Jun', amount: 3750000000 },
            { month: 'Jul', amount: 3800000000 },
          ]}
          xKey="month"
          bars={[{ key: 'amount', name: 'Net Payroll', color: CHART_COLORS[0] }]}
          height={280}
        />
      </Card>

      <div className="reports-filter-bar">
        <div className="filter-group">
          <label>Year</label>
          <select className="filter-select" value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Month</label>
          <select className="filter-select" value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
            {Array.from({length: 12}, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="reports-grid">
        {reportTypes.map((r, i) => {
          const Icon = r.icon;
          return (
            <Card key={i} className="report-card" hover>
              <div className="report-card-body" onClick={() => generateReport(r)}>
                <div className="report-card-content">
                  <span className="report-icon"><Icon fontSize="small" /></span>
                  <div>
                    <h4 className="report-name">{r.name}</h4>
                    <p className="report-desc">{r.desc}</p>
                  </div>
                </div>
              </div>
              <div className="report-card-actions">
                <Badge variant="neutral">{r.format}</Badge>
                <Button variant="ghost" size="sm" onClick={() => generateReport(r)}>
                  {formatIcon[r.format] || null} Generate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
