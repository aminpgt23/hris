import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import BottomNav from './components/layout/BottomNav';

// Styles
import './styles/globals.css';

// Pages / Modules
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import { EmployeeList, DepartmentTree } from './modules/core-hr';
import { Attendance } from './modules/attendance';
import { LeaveManagement } from './modules/leave';
import { Payroll } from './modules/payroll';
import { Compliance } from './modules/compliance';
import { ESS, MyPayslip } from './modules/ess';
import { AssetManagement } from './modules/asset';
import { Training } from './modules/training';
import { Notifications } from './modules/notification';
import { Reports } from './modules/reports';
import SystemSettings from './modules/system/SystemSettings';
import MasterData from './modules/master-data/MasterData';
import { Approvals } from './modules/approvals';
import { Help } from './modules/help';

// ---------- Protected Route ----------
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ---------- Role Protected Route ----------
const RoleRoute = ({ roles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.roleName)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ---------- Main Layout ----------
const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className={`mobile-sidebar-wrapper ${mobileSidebarOpen ? 'open' : ''}`}>
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobileView={true}
        />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Topbar />
        <main className="app-content">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

// ---------- App Content ----------
const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
      } />
      <Route path="/master-data" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator']}><MasterData /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/core-hr" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Manager']}><EmployeeList /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/core-hr/departments" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Manager']}><DepartmentTree /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>
      } />
      <Route path="/leave" element={
        <ProtectedRoute><MainLayout><LeaveManagement /></MainLayout></ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Finance', 'Director']}><Payroll /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/compliance" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Finance', 'Director']}><Compliance /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/my-payslip" element={
        <ProtectedRoute><MainLayout><MyPayslip /></MainLayout></ProtectedRoute>
      } />
      <Route path="/ess" element={
        <ProtectedRoute><MainLayout><ESS /></MainLayout></ProtectedRoute>
      } />
      <Route path="/asset" element={
        <ProtectedRoute><MainLayout><AssetManagement /></MainLayout></ProtectedRoute>
      } />
      <Route path="/training" element={
        <ProtectedRoute><MainLayout><Training /></MainLayout></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Manager', 'Finance', 'Director']}><Reports /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/system/*" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator']}><SystemSettings /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/approvals/*" element={
        <ProtectedRoute><MainLayout><RoleRoute roles={['Administrator', 'HR Staff', 'Manager', 'Director']}><Approvals /></RoleRoute></MainLayout></ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute><MainLayout><Help /></MainLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// ---------- App Root ----------
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
