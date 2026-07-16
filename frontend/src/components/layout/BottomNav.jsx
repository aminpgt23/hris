import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './BottomNav.css';

const roleBottomNav = {
  Administrator: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Core HR', path: '/core-hr', icon: PeopleIcon },
    { label: 'Attendance', path: '/attendance', icon: AccessTimeIcon },
    { label: 'Payroll', path: '/payroll', icon: AccountBalanceWalletIcon },
    { label: 'More', path: '/system', icon: MoreHorizIcon },
  ],
  'HR Staff': [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Core HR', path: '/core-hr', icon: PeopleIcon },
    { label: 'Attendance', path: '/attendance', icon: AccessTimeIcon },
    { label: 'Payroll', path: '/payroll', icon: AccountBalanceWalletIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentIcon },
  ],
  Manager: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Team', path: '/core-hr', icon: PeopleIcon },
    { label: 'Attendance', path: '/attendance', icon: AccessTimeIcon },
    { label: 'Leave', path: '/leave', icon: BeachAccessIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentIcon },
  ],
  Employee: [
    { label: 'Home', path: '/dashboard', icon: DashboardIcon },
    { label: 'Profile', path: '/ess', icon: PersonIcon },
    { label: 'Attendance', path: '/attendance', icon: AccessTimeIcon },
    { label: 'Leave', path: '/leave', icon: BeachAccessIcon },
    { label: 'More', path: '/notifications', icon: MoreHorizIcon },
  ],
  Finance: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Payroll', path: '/payroll', icon: AccountBalanceWalletIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentIcon },
    { label: 'More', path: '/system', icon: MoreHorizIcon },
  ],
  Director: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Payroll', path: '/payroll', icon: AccountBalanceWalletIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentIcon },
    { label: 'More', path: '/system', icon: MoreHorizIcon },
  ],
};

const defaultNav = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'More', path: '/system', icon: MoreHorizIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const navItems = useMemo(() => {
    return roleBottomNav[user?.roleName] || defaultNav;
  }, [user?.roleName]);

  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${location.pathname.startsWith(item.path.split('?')[0]) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon fontSize="small" className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
