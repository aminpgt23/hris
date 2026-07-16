/**
 * API Service Configuration
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getRecords: (params) => api.get('/attendance', { params }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

// Leave API
export const leaveAPI = {
  getRequests: (params) => api.get('/leave/requests', { params }),
  createRequest: (data) => api.post('/leave/requests', data),
  approveRequest: (id, data) => api.post(`/leave/requests/${id}/approve`, data),
  rejectRequest: (id, data) => api.post(`/leave/requests/${id}/reject`, data),
  getBalances: (params) => api.get('/leave/balances', { params }),
};

// Payroll API
export const payrollAPI = {
  getPeriods: (params) => api.get('/payroll/periods', { params }),
  getTransactions: (id) => api.get(`/payroll/periods/${id}/transactions`),
  calculatePayroll: (id) => api.post(`/payroll/periods/${id}/calculate`),
  generatePayslips: (id) => api.post(`/payroll/periods/${id}/payslips`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getHeadcount: (params) => api.get('/dashboard/headcount', { params }),
  getAttendanceSummary: (params) => api.get('/dashboard/attendance', { params }),
  getLeaveSummary: (params) => api.get('/dashboard/leave', { params }),
  getPayrollCost: (params) => api.get('/dashboard/payroll-cost', { params }),
};

export default api;
