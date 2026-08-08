import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Help.css';

const fmtDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('id-ID');
};

const TABS = [
  { key: 'guide', icon: MenuBookIcon },
  { key: 'support', icon: SupportAgentIcon },
  { key: 'faq', icon: HelpOutlineIcon },
  { key: 'docs', icon: DescriptionIcon },
  { key: 'sk', icon: GavelIcon },
];

export default function Help({ onBack }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('guide');
  const year = new Date().getFullYear();
  const [sk, setSk] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'sk') return;
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get('/compliance/bpjs-health', { params: { year } }).catch(() => ({ data: { data: [] } })),
      api.get('/compliance/bpjs-employment', { params: { year } }).catch(() => ({ data: { data: [] } })),
      api.get('/compliance/pension', { params: { year } }).catch(() => ({ data: { data: [] } })),
      api.get('/compliance/tax-rates', { params: { year } }).catch(() => ({ data: { data: [] } })),
    ]).then(([h, e, p, tx]) => {
      if (!mounted) return;
      const build = (rows, subjectKey) => (rows.data?.data || []).map((r) => ({ ...r, subjectKey }));
      setSk([
        ...build(h, 'sk_bpjs_health'),
        ...build(e, 'sk_bpjs_employment'),
        ...build(p, 'sk_pension'),
        ...build(tx, 'sk_tax'),
      ]);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [tab, year]);

  const skNumber = (i) => {
    const pad = String(i + 1).padStart(3, '0');
    return `SK/HR/${year}/${pad}`;
  };

  const skStatus = (r) => {
    const today = new Date();
    const from = r.effective_from ? new Date(r.effective_from) : null;
    const to = r.effective_to ? new Date(r.effective_to) : null;
    if (from && from > today) return { label: t('sk_status_upcoming'), variant: 'warning' };
    if (to && to < today) return { label: t('sk_status_expired'), variant: 'danger' };
    return { label: t('sk_status_active'), variant: 'success' };
  };

  const renderGuide = () => (
    <div className="help-section">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="help-guide-item">
          <span className="help-guide-num">{n}</span>
          <div>
            <h3>{t(`guide_${n}_title`)}</h3>
            <p>{t(`guide_${n}_desc`)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSupport = () => (
    <div className="help-section">
      <div className="support-card">
        <div className="support-avatar">{t('help_developer_name').charAt(0)}</div>
        <div className="support-info">
          <h3>{t('help_contact_developer')}</h3>
          <p className="support-name">{t('help_developer_name')}</p>
          <p className="support-role">{t('help_developer_role')} · {t('help_developer_team')}</p>
          <div className="support-contacts">
            <a href={`mailto:${t('help_developer_email')}`}>{t('help_developer_email')}</a>
            <a href={`tel:${t('help_developer_phone').replace(/[^0-9+]/g, '')}`}>{t('help_developer_phone')}</a>
          </div>
        </div>
      </div>
      <p className="support-notes">{t('help_support_notes')}</p>
      <div className="support-ticket">
        <h3>{t('help_support_ticket')}</h3>
        <p>{t('help_support_ticket_desc')}</p>
        <form
          className="support-form"
          onSubmit={(e) => { e.preventDefault(); window.alert(t('help_form_success')); e.target.reset(); }}
        >
          <div className="support-form-row">
            <input className="support-input" placeholder={t('help_form_name')} required />
            <input className="support-input" type="email" placeholder={t('help_form_email')} required />
          </div>
          <input className="support-input" placeholder={t('help_form_subject')} required />
          <textarea className="support-input" rows={4} placeholder={t('help_form_message')} required />
          <div>
            <Button variant="primary" size="sm" type="submit">{t('help_form_submit')}</Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFaq = () => (
    <div className="help-section faq-list">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <details key={n} className="faq-item">
          <summary>{t(`faq_q${n}`)}</summary>
          <p>{t(`faq_a${n}`)}</p>
        </details>
      ))}
    </div>
  );

  const renderDocs = () => (
    <div className="help-section">
      {['arch', 'modules', 'tech', 'api', 'roles'].map((sec) => (
        <div key={sec} className="docs-item">
          <h3>{t(`doc_${sec}`)}</h3>
          <p>{t(`doc_${sec}_desc`)}</p>
          {sec === 'modules' && <p>{t('doc_module_list')}</p>}
          {sec === 'tech' && <p>{t('doc_tech_list')}</p>}
          {sec === 'api' && <code className="docs-code">{t('doc_api_list')}</code>}
        </div>
      ))}
    </div>
  );

  const renderSk = () => (
    <div className="help-section">
      <div className="sk-toolbar">
        <h3>{t('sk_title')} — {year}</h3>
        <Badge variant="info" size="sm">{t('sk_year')} {year}</Badge>
      </div>
      <p className="sk-subtitle">{t('sk_subtitle')}</p>
      {loading ? (
        <p className="sk-empty">{t('common_loading')}</p>
      ) : sk.length === 0 ? (
        <p className="sk-empty">{t('sk_empty')}</p>
      ) : (
        <div className="sk-table-wrap">
          <table className="sk-table">
            <thead>
              <tr>
                <th>{t('sk_no')}</th>
                <th>{t('sk_number')}</th>
                <th>{t('sk_about')}</th>
                <th>{t('sk_period')}</th>
                <th>{t('sk_status')}</th>
              </tr>
            </thead>
            <tbody>
              {sk.map((r, i) => {
                const st = skStatus(r);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="sk-num">{skNumber(i)}</td>
                    <td>{r.subjectKey ? t(r.subjectKey) : '-'}</td>
                    <td className="sk-period">{fmtDate(r.effective_from)} — {fmtDate(r.effective_to)}</td>
                    <td><Badge variant={st.variant}>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="sk-footer">{t('sk_footer')}</p>
    </div>
  );

  const renderers = { guide: renderGuide, support: renderSupport, faq: renderFaq, docs: renderDocs, sk: renderSk };

  return (
    <div className="help-page">
      <div className="help-header">
        <div>
          <h1 className="help-title">{t('help_title')}</h1>
          <p className="help-subtitle">{t('help_subtitle')}</p>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowBackIcon fontSize="small" /> {t('help_back_home')}
          </Button>
        )}
      </div>

      <div className="help-tabs">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className={`help-tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon fontSize="small" />
            <span>{t(`help_tab_${key}`)}</span>
          </button>
        ))}
      </div>

      <Card>{renderers[tab]()}</Card>
    </div>
  );
}
