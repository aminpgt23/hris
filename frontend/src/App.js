import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';

// Placeholder pages (to be implemented)
const ComingSoon = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This module is under development.</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main Layout with Navigation
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '1rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          HRIS Payroll
        </div>
        
        {/* User Info */}
        <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.9rem' }}>{user?.username}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user?.roleName}</div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/dashboard" style={navLinkStyle}>Dashboard</a>
          <a href="/corehr" style={navLinkStyle}>Core HR</a>
          <a href="/attendance" style={navLinkStyle}>Attendance</a>
          <a href="/leave" style={navLinkStyle}>Leave Management</a>
          <a href="/payroll" style={navLinkStyle}>Payroll</a>
          <a href="/compliance" style={navLinkStyle}>Compliance</a>
          <a href="/ess" style={navLinkStyle}>Employee Self Service</a>
          <a href="/asset" style={navLinkStyle}>Asset Management</a>
          <a href="/training" style={navLinkStyle}>Training</a>
          <a href="/reports" style={navLinkStyle}>Reports</a>
        </nav>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            marginTop: '2rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: '250px',
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: '2rem'
      }}>
        {children}
      </main>
    </div>
  );
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

// App Content with Routes
const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/corehr/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Core HR" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Attendance" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Leave Management" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Payroll" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Compliance" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ess/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Employee Self Service" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asset/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Asset Management" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Training" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ComingSoon title="Reports" />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
