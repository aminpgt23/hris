import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { employeeAPI } from '../../services/api';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Notification dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: ⌘K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  const debounceRef = useRef(null);
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSelectedIndex(-1);
    try {
      const res = await employeeAPI.getAll({ search: query, limit: 8 });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setSearchResults(res.data.data);
        setSearchOpen(true);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, handleSearch]);

  // Keyboard navigation on search results
  const handleSearchKeyDown = (e) => {
    if (!searchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(searchResults[selectedIndex]);
    }
  };

  const handleResultClick = (employee) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate('/core-hr', { state: { highlightEmployee: employee.id } });
  };

  // Mock notifications data
  const notifications = [
    { id: 1, title: 'Leave Request', message: 'John Doe submitted a leave request', time: '5m ago', unread: true, type: 'leave' },
    { id: 2, title: 'Payroll', message: 'Payroll for June is ready for approval', time: '1h ago', unread: true, type: 'payroll' },
    { id: 3, title: 'Attendance', message: '3 employees have not checked in today', time: '3h ago', unread: false, type: 'attendance' },
    { id: 4, title: 'Training', message: 'New training session scheduled', time: '1d ago', unread: false, type: 'training' },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notif) => {
    setNotifOpen(false);
    if (notif.type === 'leave') navigate('/leave');
    else if (notif.type === 'payroll') navigate('/payroll');
    else if (notif.type === 'attendance') navigate('/attendance');
    else if (notif.type === 'training') navigate('/training');
  };

  const handleProfileAction = (action) => {
    setProfileOpen(false);
    if (action === 'profile') navigate('/ess');
    else if (action === 'settings') navigate('/system');
    else if (action === 'logout') logout();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-search" ref={searchRef}>
          <span className="search-icon">
            <SearchIcon fontSize="small" />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
            onKeyDown={handleSearchKeyDown}
          />
          {!searchQuery && <span className="search-shortcut">⌘K</span>}

          {/* Search dropdown */}
          {searchOpen && (
            <div className="search-dropdown">
              {searchLoading ? (
                <div className="search-dropdown-loading">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="search-dropdown-empty">
                  {searchQuery ? 'No employees found' : 'Type to search employees'}
                </div>
              ) : (
                <>
                  <div className="search-dropdown-header">
                    <span className="search-dropdown-title">Employees</span>
                    <span className="search-dropdown-count">{searchResults.length} found</span>
                  </div>
                  <div className="search-dropdown-body">
                    {searchResults.map((emp, idx) => (
                      <div
                        key={emp.id}
                        className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleResultClick(emp)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div className="search-result-avatar">
                          {emp.first_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-name">
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span className="search-result-meta">
                            {emp.employee_number}
                            {emp.department_name && ` · ${emp.department_name}`}
                            {emp.position_name && ` · ${emp.position_name}`}
                          </span>
                        </div>
                        {idx === selectedIndex && (
                          <span className="search-result-hint">↩</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme Toggle */}
        <button className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
        </button>

        {/* Notifications */}
        <div className="topbar-notif-wrapper" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            title="Notifications"
          >
            <NotificationsIcon fontSize="small" />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {notifOpen && (
            <div className="topbar-dropdown notif-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications</span>
                <span className="dropdown-badge">{unreadCount} new</span>
              </div>
              <div className="dropdown-body">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.unread ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="notif-content">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-message">{n.message}</span>
                    </div>
                    <span className="notif-time">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer" onClick={() => { setNotifOpen(false); navigate('/notifications'); }}>
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-profile-wrapper" ref={profileRef}>
          <div
            className="topbar-profile"
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          >
            <div className="profile-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.username || 'User'}</span>
              <span className="profile-role">{user?.roleName || ''}</span>
            </div>
            <KeyboardArrowDownIcon fontSize="small" className="profile-arrow" />
          </div>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">{user?.username || 'User'}</span>
                  <span className="profile-dropdown-email">{user?.email || ''}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" onClick={() => handleProfileAction('profile')}>
                <PersonIcon fontSize="small" />
                <span>My Profile</span>
              </div>
              <div className="dropdown-item" onClick={() => handleProfileAction('settings')}>
                <SettingsIcon fontSize="small" />
                <span>Settings</span>
              </div>
              <div className="dropdown-item" onClick={() => { setProfileOpen(false); }}>
                <HelpOutlineIcon fontSize="small" />
                <span>Help</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item logout-item" onClick={() => handleProfileAction('logout')}>
                <LogoutIcon fontSize="small" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
