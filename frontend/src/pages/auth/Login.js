import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = (username, password) => {
    setFormData({ username, password });
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes" />

      <div className="login-container">
        {/* Brand Section */}
        <div className="login-brand">
          <div className="login-logo">H</div>
          <h1 className="login-title">HRIS System</h1>
          <p className="login-subtitle">Enterprise System</p>
          <p className="login-desc">
            Complete human resource information system with integrated payroll,
            attendance, leave, compliance, and analytics.
          </p>
        </div>

        {/* Form Section */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            <h2 className="login-form-title">Sign In</h2>
            <p className="login-form-subtitle">Enter your credentials to continue</p>

            {error && (
              <div className="login-error">
                <span className="login-error-icon">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon"><PersonIcon fontSize="small" /></span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="login-input"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon"><LockIcon fontSize="small" /></span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="login-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <><span className="login-spinner" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials Toggle */}
            <div className="login-demo-toggle">
              <button
                type="button"
                className="login-demo-btn"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? 'Hide' : 'Show'} Demo Credentials
              </button>

              {showDemo && (
                <div className="login-demo-list">
                  {[
                    { role: 'Administrator', user: 'admin', pass: 'admin123' },
                    { role: 'HR Staff', user: 'hrstaff', pass: 'hr123' },
                    { role: 'Manager', user: 'manager', pass: 'mgr123' },
                    { role: 'Employee', user: 'employee', pass: 'emp123' },
                    { role: 'Finance', user: 'finance', pass: 'fin123' },
                    { role: 'Director', user: 'director', pass: 'dir123' },
                  ].map(demo => (
                    <button
                      key={demo.user}
                      type="button"
                      className="login-demo-item"
                      onClick={() => fillDemo(demo.user, demo.pass)}
                    >
                      <span className="demo-role">{demo.role}</span>
                      <span className="demo-cred">{demo.user} / {demo.pass}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="login-footer-text">
            &copy; {new Date().getFullYear()} HRIS System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
