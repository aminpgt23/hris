import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal } from '../../components/ui';
import api from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import './ESS.css';

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-';
  const n = Number(val);
  if (Number.isNaN(n)) return '-';
  return 'Rp ' + n.toLocaleString('id-ID');
};

const paymentBadge = {
  Pending: <Badge variant="warning">Pending</Badge>,
  Paid: <Badge variant="success">Paid</Badge>,
  Failed: <Badge variant="danger">Failed</Badge>,
  'On Hold': <Badge variant="neutral">On Hold</Badge>,
};

export default function MyPayslip() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ess/payslips').catch(() => ({ data: { data: [] } }));
      setPayslips(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>My Payslip</h1>
          <p>View your payroll slips (read-only)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}><RefreshIcon fontSize="small" /></Button>
      </div>

      {loading ? (
        <Card><div className="text-center" style={{ padding: '20px' }}>Loading payslips...</div></Card>
      ) : payslips.length === 0 ? (
        <Card>
          <div className="text-center" style={{ padding: '20px', color: 'var(--color-text-tertiary)' }}>
            <ReceiptIcon style={{ fontSize: 40, opacity: 0.4, marginBottom: 8 }} />
            <div>No payslips available yet</div>
          </div>
        </Card>
      ) : (
        <Card>
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Payment Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(p => (
                <tr key={p.id}>
                  <td>{p.period_name || '-'}</td>
                  <td>{formatCurrency(p.gross_salary)}</td>
                  <td>-{formatCurrency(p.deductions_total ?? p.deductions)}</td>
                  <td>{formatCurrency(p.net_salary)}</td>
                  <td>{paymentBadge[p.payment_status] || p.payment_status || '-'}</td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => setDetail(p)}>Detail</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.period_name || 'Payslip Detail'}>
        {detail && (
          <div className="ess-payslip-detail">
            <div className="ps-row"><span>Employee</span><span>{detail.employee_name || '-'}</span></div>
            <div className="ps-row"><span>Period</span><span>{detail.period_name || '-'}</span></div>
            <div className="ps-row"><span>Working Days</span><span>{detail.working_days ?? '-'}</span></div>
            <div className="ps-row"><span>Present Days</span><span>{detail.present_days ?? '-'}</span></div>
            <div className="ps-row"><span>Overtime Hours</span><span>{detail.overtime_hours ?? '-'}</span></div>
            <div className="ps-section-label">Earnings</div>
            {Object.entries(detail.earnings || {}).map(([k, v]) => (
              <div className="ps-row" key={k}><span>{k}</span><span>{formatCurrency(v)}</span></div>
            ))}
            <div className="ps-row ps-total"><span>Gross Salary</span><span>{formatCurrency(detail.gross_salary)}</span></div>
            <div className="ps-section-label">Deductions</div>
            {Object.entries(detail.deductions || {}).map(([k, v]) => (
              <div className="ps-row" key={k}><span>{k}</span><span>-{formatCurrency(v)}</span></div>
            ))}
            <div className="ps-row"><span>Total Deductions</span><span>-{formatCurrency(detail.deductions_total ?? detail.deductions)}</span></div>
            <div className="ps-row ps-net"><span>Net Salary</span><span>{formatCurrency(detail.net_salary)}</span></div>
            <div className="ps-row"><span>Payment Method</span><span>{detail.payment_method || '-'}</span></div>
            <div className="ps-row"><span>Payment Status</span><span>{paymentBadge[detail.payment_status] || detail.payment_status || '-'}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
