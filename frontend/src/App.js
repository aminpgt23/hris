import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

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
import { ESS } from './modules/ess';
import { AssetManagement } from './modules/asset';
import { Training } from './modules/training';
import { Notifications } from './modules/notification';
import { Reports } from './modules/reports';
import SystemSettings from './modules/system/SystemSettings';
import MasterData from './modules/master-data/MasterData';

// ---------- Protected Route ----------
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
        <ProtectedRoute><MainLayout><MasterData /></MainLayout></ProtectedRoute>
      } />
      <Route path="/core-hr" element={
        <ProtectedRoute><MainLayout><EmployeeList /></MainLayout></ProtectedRoute>
      } />
      <Route path="/core-hr/departments" element={
        <ProtectedRoute><MainLayout><DepartmentTree /></MainLayout></ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>
      } />
      <Route path="/leave" element={
        <ProtectedRoute><MainLayout><LeaveManagement /></MainLayout></ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute><MainLayout><Payroll /></MainLayout></ProtectedRoute>
      } />
      <Route path="/compliance" element={
        <ProtectedRoute><MainLayout><Compliance /></MainLayout></ProtectedRoute>
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
        <ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>
      } />
      <Route path="/system/*" element={
        <ProtectedRoute><MainLayout><SystemSettings /></MainLayout></ProtectedRoute>
      } />
      <Route path="/approvals/*" element={
        <ProtectedRoute><MainLayout>
          <div className="coming-soon">
            <h2>Approvals</h2>
            <p>Approval workflows coming soon.</p>
          </div>
        </MainLayout></ProtectedRoute>
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
      <Router>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
