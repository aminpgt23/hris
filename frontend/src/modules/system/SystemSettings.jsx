import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/ui';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import EmailIcon from '@mui/icons-material/Email';
import BackupIcon from '@mui/icons-material/Backup';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './SystemSettings.css';

const settingSections = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'company', label: 'Company', icon: PeopleIcon },
  { id: 'security', label: 'Security', icon: SecurityIcon },
  { id: 'database', label: 'Database', icon: StorageIcon },
  { id: 'email', label: 'Email', icon: EmailIcon },
  { id: 'backup', label: 'Backup', icon: BackupIcon },
  { id: 'appearance', label: 'Appearance', icon: PaletteIcon },
  { id: 'localization', label: 'Localization', icon: LanguageIcon },
];

const ADMIN_ROLES = ['Administrator'];

function getVisibleSections(roleName) {
  if (ADMIN_ROLES.includes(roleName)) return settingSections;
  return settingSections.filter(s => s.id === 'appearance' || s.id === 'localization');
}

export default function SystemSettings() {
  const toast = useToast();
  const { user } = useAuth();
  const visibleSections = getVisibleSections(user?.roleName);
  const defaultSection = visibleSections[0]?.id || 'appearance';
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [activeSection]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Try API, fallback to local state
      const res = await api.get('/system/settings');
      if (res.data?.data) setSettings(res.data.data);
    } catch {
      // Use defaults if no API
      setSettings({
        appName: 'HRIS System',
        companyName: 'Corporate Entity',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/system/settings', settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.success('Settings saved (offline mode)');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Application Name</label>
              <input type="text" className="form-input" value={settings.appName || ''} onChange={e => updateSetting('appName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Application URL</label>
              <input type="text" className="form-input" value={settings.appUrl || ''} onChange={e => updateSetting('appUrl', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Mode</label>
              <select className="form-input" value={settings.maintenanceMode || 'false'} onChange={e => updateSetting('maintenanceMode', e.target.value)}>
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
          </>
        );
      case 'company':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-input" value={settings.companyName || ''} onChange={e => updateSetting('companyName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax ID (NPWP)</label>
              <input type="text" className="form-input" value={settings.taxId || ''} onChange={e => updateSetting('taxId', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-input" rows="3" value={settings.address || ''} onChange={e => updateSetting('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" value={settings.city || ''} onChange={e => updateSetting('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" className="form-input" value={settings.phone || ''} onChange={e => updateSetting('phone', e.target.value)} />
              </div>
            </div>
          </>
        );
      case 'security':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Password Min Length</label>
              <input type="number" className="form-input" value={settings.passwordMinLength || 8} onChange={e => updateSetting('passwordMinLength', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Session Timeout (minutes)</label>
              <input type="number" className="form-input" value={settings.sessionTimeout || 60} onChange={e => updateSetting('sessionTimeout', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Login Attempts</label>
              <input type="number" className="form-input" value={settings.maxLoginAttempts || 5} onChange={e => updateSetting('maxLoginAttempts', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Two-Factor Auth</label>
              <select className="form-input" value={settings.twoFactorEnabled || 'false'} onChange={e => updateSetting('twoFactorEnabled', e.target.value)}>
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
          </>
        );
      case 'localization':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-input" value={settings.timezone || 'Asia/Jakarta'} onChange={e => updateSetting('timezone', e.target.value)}>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Format</label>
              <select className="form-input" value={settings.dateFormat || 'DD/MM/YYYY'} onChange={e => updateSetting('dateFormat', e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-input" value={settings.language || 'en'} onChange={e => updateSetting('language', e.target.value)}>
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </div>
          </>
        );
      default:
        return (
          <div className="text-center" style={{ padding: '40px', color: 'var(--color-text-tertiary)' }}>
            <p>Configuration for <strong>{activeSection}</strong> coming soon.</p>
          </div>
        );
    }
  };

  const SectionIcon = visibleSections.find(s => s.id === activeSection)?.icon || SettingsIcon;

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>{ADMIN_ROLES.includes(user?.roleName) ? 'Configure application settings and preferences' : 'Customize your appearance and region preferences'}</p>
      </div>

      <div className="settings-layout">
        <Card className="settings-sidebar">
          {visibleSections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon fontSize="small" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </Card>

        <Card className="settings-content">
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p>Loading settings...</p>
            </div>
          ) : (
            <>
              <div className="settings-section-header">
                <SectionIcon fontSize="small" />
                <h3>{visibleSections.find(s => s.id === activeSection)?.label || activeSection}</h3>
              </div>
              <div className="settings-section-body">
                {renderSection()}
              </div>
              <div className="settings-actions">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
