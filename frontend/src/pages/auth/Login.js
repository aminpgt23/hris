import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, toggleLang } = useLanguage();
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
      setError(result.message || t('login_failed'));
    }
    setLoading(false);
  };

  const fillDemo = (username, password) => {
    setFormData({ username, password });
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes" />

      <button type="button" className="login-lang-toggle" onClick={toggleLang}>
        <LanguageIcon fontSize="small" />
        <span>{t('login_lang_switch')}</span>
      </button>

      <div className="login-container">
        {/* Brand Section */}
        <div className="login-brand">
          <img
            src={`${process.env.PUBLIC_URL || ''}/logo.png`}
            alt="Human Resource"
            className="login-logo"
          />
          <h1 className="login-title">{t('login_title')}</h1>
          <p className="login-subtitle">{t('login_subtitle')}</p>
          <p className="login-desc">{t('login_desc')}</p>
        </div>

        {/* Form Section */}
        <div className="login-form-wrapper">
          <div className="login-mobile-logo">
            <img
              src={`${process.env.PUBLIC_URL || ''}/logo.png`}
              alt="Human Resource"
              className="login-logo"
            />
            <h1 className="login-title">{t('login_title')}</h1>
          </div>

          <div className="login-form-card">
            <h2 className="login-form-title">{t('login_signin')}</h2>
            <p className="login-form-subtitle">{t('login_sub_signin')}</p>

            {error && (
              <div className="login-error">
                <span className="login-error-icon">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('login_username')}</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon"><PersonIcon fontSize="small" /></span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="login-input"
                    placeholder={t('login_placeholder_user')}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('login_password')}</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon"><LockIcon fontSize="small" /></span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="login-input"
                    placeholder={t('login_placeholder_pass')}
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
                  <><span className="login-spinner" /> {t('login_signing_in')}</>
                ) : (
                  t('login_signin')
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
                {showDemo ? t('login_demo_hide') : t('login_demo_show')} {t('login_demo')}
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
            {t('login_copyright').replace('{year}', new Date().getFullYear())}
          </p>
        </div>
      </div>
    </div>
  );
}
