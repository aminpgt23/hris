import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    // For demo, use mock data
    const fetchDashboardData = async () => {
      try {
        // Mock data for demonstration
        setStats({
          totalEmployees: 245,
          presentToday: 218,
          onLeave: 15,
          pendingApprovals: 8,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Dashboard</h1>
        <p style={{ margin: 0, color: '#666' }}>Welcome to HRIS Payroll Enterprise System</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon="👥"
          color="#1976d2"
          trend="+5 this month"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon="✓"
          color="#4caf50"
          trend={`${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance rate`}
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon="🏖️"
          color="#ff9800"
          trend="15 employees away"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="⏳"
          color="#f44336"
          trend="Requires attention"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Headcount Trend Chart Placeholder */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Headcount Trend</h3>
          <div style={{
            height: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            color: '#999'
          }}>
            [Chart: Headcount Trend - Last 6 Months]
          </div>
        </div>

        {/* Attendance Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Attendance Summary</h3>
          <AttendanceSummary />
        </div>

        {/* Leave Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Leave Summary</h3>
          <LeaveSummary />
        </div>

        {/* Payroll Cost Overview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Payroll Cost Overview</h3>
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            color: '#999'
          }}>
            [Chart: Monthly Payroll Cost]
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div style={{
        marginTop: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Recent Activities</h3>
        <RecentActivities />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>{title}</p>
        <h2 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>{value}</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: trend.includes('+') ? '#4caf50' : '#666', fontSize: '0.85rem' }}>
          {trend}
        </p>
      </div>
      <div style={{
        fontSize: '2.5rem',
        opacity: 0.3,
        color
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// Attendance Summary Component
const AttendanceSummary = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1rem' }}>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>218</div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>Present</div>
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>5</div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>Absent</div>
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>12</div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>Late</div>
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>10</div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>WFH</div>
      </div>
    </div>
    <div style={{
      height: '8px',
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden',
      display: 'flex'
    }}>
      <div style={{ width: '70%', backgroundColor: '#4caf50' }}></div>
      <div style={{ width: '5%', backgroundColor: '#f44336' }}></div>
      <div style={{ width: '10%', backgroundColor: '#ff9800' }}></div>
      <div style={{ width: '15%', backgroundColor: '#2196f3' }}></div>
    </div>
  </div>
);

// Leave Summary Component
const LeaveSummary = () => (
  <div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e0e0e0', color: '#666', fontSize: '0.85rem' }}>Leave Type</th>
          <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '2px solid #e0e0e0', color: '#666', fontSize: '0.85rem' }}>Active</th>
          <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '2px solid #e0e0e0', color: '#666', fontSize: '0.85rem' }}>Pending</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>Annual Leave</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>8</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>3</td>
        </tr>
        <tr>
          <td style={{ padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>Sick Leave</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>5</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>1</td>
        </tr>
        <tr>
          <td style={{ padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>Personal Leave</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>2</td>
          <td style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>2</td>
        </tr>
        <tr>
          <td style={{ padding: '0.75rem' }}>Other</td>
          <td style={{ textAlign: 'right', padding: '0.75rem' }}>0</td>
          <td style={{ textAlign: 'right', padding: '0.75rem' }}>1</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Recent Activities Component
const RecentActivities = () => {
  const activities = [
    { type: 'leave', message: 'John Doe submitted leave request', time: '5 mins ago', color: '#2196f3' },
    { type: 'attendance', message: 'Late check-in detected for 3 employees', time: '15 mins ago', color: '#ff9800' },
    { type: 'approval', message: 'Payroll period Dec 2024 approved', time: '1 hour ago', color: '#4caf50' },
    { type: 'employee', message: 'New employee onboarded: Jane Smith', time: '2 hours ago', color: '#9c27b0' },
    { type: 'payroll', message: 'Payslips generated for Nov 2024', time: '3 hours ago', color: '#1976d2' },
  ];

  return (
    <div>
      {activities.map((activity, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '0.75rem 0',
            borderBottom: index < activities.length - 1 ? '1px solid #e0e0e0' : 'none'
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: activity.color,
            marginRight: '1rem',
            marginTop: '0.5rem'
          }}></div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: '#333' }}>{activity.message}</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#999', fontSize: '0.85rem' }}>{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
