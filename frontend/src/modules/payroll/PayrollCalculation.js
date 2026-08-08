import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './Payroll.css';

const Rp = (v) => v != null ? `Rp${Number(v).toLocaleString('id-ID')}` : '-';

const TAX_CATEGORIES = ['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3'];

const emptyForm = {
  employee_id: '',
  employee_name: '',
  position: '',
  tax_category: 'TK0',
  tax_method: 'TER',
  basic_salary: 0,
  position_allowance: 0,
  meal_days: 0,
  meal_per_day: 0,
  transport_days: 0,
  transport_per_day: 0,
  overtime: 0,
  bonus: 0,
  bpjs_base: 0,
  kasbon: 0,
  absence_deduction: 0,
  iuran_pensiun_monthly: 0,
  jkk_rate: 0.54,
};

function NumInput({ label, value, onChange, step = 'any', disabled }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type="number" step={step} className="form-input" value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    </div>
  );
}

function Row({ children }) {
  return <div className="form-row">{children}</div>;
}

export default function PayrollCalculation() {
  const toast = useToast();
  const [form, setForm] = useState({ ...emptyForm });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputsLoading, setInputsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesError, setEmployeesError] = useState('');
  const [calcError, setCalcError] = useState('');

  useEffect(() => {
    api.get('/payroll/employees')
      .then(r => { setEmployees(r.data?.data || []); setEmployeesError(''); })
      .catch(() => setEmployeesError('Failed to load employee list - is the backend running?'));
  }, []);

  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  const loadEmployee = async (employeeId) => {
    if (!employeeId) {
      setForm({ ...emptyForm });
      setResult(null);
      return;
    }
    setInputsLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/payroll/calculation-inputs/${employeeId}`);
      const d = res.data?.data || {};
      setForm({
        ...emptyForm,
        ...d,
        employee_id: d.employee_id ?? employeeId,
        tax_method: 'TER',
        meal_days: d.attendance?.working_days || 0,
        transport_days: d.attendance?.working_days || 0,
        absence_deduction: (d.attendance?.late_days || 0) * 50000,
      });
      if (!d.has_assignment) {
        toast.warning?.(`${d.employee_name} has no active salary assignment - basic salary will be 0.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load employee data');
    } finally {
      setInputsLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcError('');
    if (!form.employee_id) return toast.error('Select an employee first');
    setLoading(true);
    try {
      const res = await api.post('/payroll/calculate', form);
      setResult(res.data?.data || null);
      if (!res.data?.data) setCalcError('Calculation returned no result - check backend logs.');
      toast.success('Payroll calculated');
    } catch (err) {
      setResult(null);
      const msg = err.response?.data?.message || 'Calculation failed - is the backend running?';
      setCalcError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const { income, deductions, take_home_pay, employer_cost, cost_to_company } = result || {};

  return (
    <div className="sim-grid">
      <Card>
        <div className="sim-card-title">Employee</div>
        <form id="sim-form" onSubmit={handleCalculate}>
          <Row>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Employee</label>
              <select className="form-input" value={form.employee_id}
                onChange={e => loadEmployee(e.target.value)}>
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.employee_number} - {emp.employee_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tax Status (PTKP)</label>
              <select className="form-input" value={form.tax_category}
                onChange={e => set('tax_category')(e.target.value)}>
                {TAX_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PPH21 Method</label>
              <select className="form-input" value={form.tax_method}
                onChange={e => set('tax_method')(e.target.value)}>
                <option value="TER">TER (PMK 168/2023)</option>
                <option value="pasal17">Pasal 17 (annual ÷ 12)</option>
              </select>
            </div>
          </Row>
          <p className="sim-hint">
            {inputsLoading
              ? 'Loading employee data from database...'
              : employeesError
                ? employeesError
                : form.employee_id
                  ? `${form.employee_name || ''}${form.position ? ` - ${form.position}` : ''}`
                  : 'Select an employee - salary components load automatically from the database.'}
          </p>
          {calcError && <p className="sim-error">{calcError}</p>}

          <div className="sim-card-title">Income Components</div>
          <Row>
            <NumInput label="Basic Salary (Rp)" value={form.basic_salary} onChange={set('basic_salary')} step="1000" />
            <NumInput label="Position Allowance (Rp)" value={form.position_allowance} onChange={set('position_allowance')} step="1000" />
            <NumInput label="Overtime (Rp)" value={form.overtime} onChange={set('overtime')} step="1000" />
            <NumInput label="Bonus (Rp)" value={form.bonus} onChange={set('bonus')} step="1000" />
          </Row>
          <Row>
            <NumInput label="Meal Allowance - Days" value={form.meal_days} onChange={set('meal_days')} step="1" />
            <NumInput label="Meal Allowance - Per Day (Rp)" value={form.meal_per_day} onChange={set('meal_per_day')} step="1000" />
            <NumInput label="Transport - Days" value={form.transport_days} onChange={set('transport_days')} step="1" />
            <NumInput label="Transport - Per Day (Rp)" value={form.transport_per_day} onChange={set('transport_per_day')} step="1000" />
          </Row>

          <div className="sim-card-title">Deduction Inputs</div>
          <Row>
            <NumInput label="BPJS Base (Rp)" value={form.bpjs_base} onChange={set('bpjs_base')} step="1000" />
            <NumInput label="Kasbon (Rp)" value={form.kasbon} onChange={set('kasbon')} step="1000" />
            <NumInput label="Absence Deduction (Rp)" value={form.absence_deduction} onChange={set('absence_deduction')} step="1000" />
            <NumInput label="Pension Contribution (Rp/mo)" value={form.iuran_pensiun_monthly} onChange={set('iuran_pensiun_monthly')} step="1000" />
          </Row>

          <div className="flex gap-2" style={{ marginTop: 'var(--space-3)' }}>
            <Button variant="primary" size="sm" type="submit" loading={loading}>Calculate</Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => loadEmployee(form.employee_id)}>Refresh Data</Button>
          </div>
        </form>
      </Card>

      {result && income && (
        <Card>
          <div className="sim-card-title">Result - {form.employee_name || 'Employee'}</div>

          <div className="sim-block">
            <div className="sim-block-title">Income (Gross)</div>
            {[
              ['Basic Salary', income.basic_salary],
              ['Position Allowance', income.position_allowance],
              ['Meal Allowance', income.meal_allowance],
              ['Transport Allowance', income.transport_allowance],
              ['Overtime', income.overtime],
              ['Bonus', income.bonus],
            ].map(([label, val]) => (
              <div key={label} className="sim-line">
                <span>{label}</span><span>{Rp(val)}</span>
              </div>
            ))}
            <div className="sim-line sim-total">
              <span>Gross Income</span><span>{Rp(income.gross_income)}</span>
            </div>
          </div>

          <div className="sim-block">
            <div className="sim-block-title">Deductions</div>
            <div className="sim-line"><span>BPJS Kesehatan (1%)</span><span>{Rp(deductions.bpjs_health)}</span></div>
            <div className="sim-line"><span>JHT (2%)</span><span>{Rp(deductions.jht)}</span></div>
            <div className="sim-line"><span>JP (1%)</span><span>{Rp(deductions.jp)}</span></div>
            <div className="sim-line">
              <span>PPH21 {deductions.pph21_detail?.method === 'TER'
                ? `(TER Kategori ${deductions.pph21_detail.terCategory} ${deductions.pph21_detail.terRate}%)`
                : '(Pasal 17)'}</span>
              <span>{Rp(deductions.pph21)}</span>
            </div>
            <div className="sim-line"><span>Pension (Employee)</span><span>{Rp(deductions.iuran_pensiun)}</span></div>
            <div className="sim-line"><span>Kasbon</span><span>{Rp(deductions.kasbon)}</span></div>
            <div className="sim-line"><span>Absence Deduction</span><span>{Rp(deductions.absence_deduction)}</span></div>
            <div className="sim-line sim-total">
              <span>Total Deduction</span><span>{Rp(deductions.total_deduction)}</span>
            </div>
          </div>

          <div className="sim-block sim-thp">
            <div className="sim-line sim-total">
              <span>Take Home Pay (THP)</span><span>{Rp(take_home_pay)}</span>
            </div>
          </div>

          <div className="sim-block">
            <div className="sim-block-title">Employer Cost (does not reduce THP)</div>
            <div className="sim-line"><span>BPJS Kesehatan (4%)</span><span>{Rp(employer_cost.bpjs_health)}</span></div>
            <div className="sim-line"><span>JHT (3.7%)</span><span>{Rp(employer_cost.jht)}</span></div>
            <div className="sim-line"><span>JKK ({form.jkk_rate}%)</span><span>{Rp(employer_cost.jkk)}</span></div>
            <div className="sim-line"><span>JKM (0.30%)</span><span>{Rp(employer_cost.jkm)}</span></div>
            <div className="sim-line"><span>JP (2%)</span><span>{Rp(employer_cost.jp)}</span></div>
            <div className="sim-line"><span>Pension (Employer) {result.config?.pension_fund ? `(${result.config.pension_fund})` : ''}</span><span>{Rp(employer_cost.pension)}</span></div>
            <div className="sim-line sim-total">
              <span>Total Employer Cost</span><span>{Rp(employer_cost.total_employer_cost)}</span>
            </div>
          </div>

          <div className="sim-block sim-thp">
            <div className="sim-line sim-total">
              <span>Cost To Company (CTC)</span><span>{Rp(cost_to_company)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
