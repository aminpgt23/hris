import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GavelIcon from '@mui/icons-material/Gavel';
import InventoryIcon from '@mui/icons-material/Inventory';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './Sidebar.css';

const IconMap = {
  Dashboard: DashboardIcon,
  'Master Data': StorageIcon,
  'Core HR': PeopleIcon,
  Attendance: AccessTimeIcon,
  Leave: BeachAccessIcon,
  Payroll: AccountBalanceWalletIcon,
  Compliance: GavelIcon,
  Asset: InventoryIcon,
  Training: SchoolIcon,
  Reports: AssessmentIcon,
  System: SettingsIcon,
  Approvals: CheckCircleIcon,
  'My Profile': PersonIcon,
  Notifications: NotificationsIcon,
  'My Payslip': ReceiptIcon,
  'Bank Export': AccountBalanceIcon,
};

// Per-role menu definitions
const roleMenus = {
  Administrator: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Master Data', path: '/master-data' },
    { label: 'Core HR', path: '/core-hr' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Leave', path: '/leave' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Compliance', path: '/compliance' },
    { label: 'Asset', path: '/asset' },
    { label: 'Training', path: '/training' },
    { label: 'Reports', path: '/reports' },
    { label: 'System', path: '/system' },
  ],
  'HR Staff': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Core HR', path: '/core-hr' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Leave', path: '/leave' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Compliance', path: '/compliance' },
    { label: 'Reports', path: '/reports' },
  ],
  Manager: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Team Attendance', path: '/attendance' },
    { label: 'Team Leave', path: '/leave' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Reports', path: '/reports' },
    { label: 'Team Profile', path: '/core-hr' },
  ],
  Employee: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Profile', path: '/ess' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Apply Leave', path: '/leave' },
    { label: 'My Payslip', path: '/payroll' },
    { label: 'My Assets', path: '/asset' },
    { label: 'Training', path: '/training' },
    { label: 'Notifications', path: '/notifications' },
  ],
  Finance: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll Process', path: '/payroll' },
    { label: 'Payroll Approval', path: '/payroll?tab=approval' },
    { label: 'Payslips', path: '/payroll?tab=payslips' },
    { label: 'Reports', path: '/reports' },
    { label: 'Bank Export', path: '/payroll?tab=export' },
  ],
  Director: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll Approval', path: '/payroll?tab=approval' },
    { label: 'Compliance', path: '/compliance' },
    { label: 'Reports', path: '/reports' },
  ],
};

const defaultMenu = [
  { label: 'Dashboard', path: '/dashboard' },
];

const SidebarIcon = ({ label }) => {
  const Icon = IconMap[label];
  return Icon ? <Icon fontSize="small" /> : null;
};

export default function Sidebar({ collapsed, onToggle, mobileView }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(() => {
    return roleMenus[user?.roleName] || defaultMenu;
  }, [user?.roleName]);

  const isActive = (path) => {
    const pathBase = path.split('?')[0];
    return location.pathname.startsWith(pathBase);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileView ? 'sidebar-mobile' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          {collapsed ? 'H' : 'HR'}
        </div>
        {!collapsed && <span className="sidebar-brand-text">System</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="sidebar-icon">
              <SidebarIcon label={item.label} />
            </span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <button className="sidebar-collapse-btn" onClick={onToggle}>
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </button>
    </aside>
  );
}
