# HRIS Payroll Enterprise System

Sistem **HRIS Payroll Enterprise** (multi-company, multi-branch) dengan tech stack:
- **Frontend**: React (component-based, responsive)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT + role-based access control

## 📁 Struktur Project

```
/workspace
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Database & configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling, logging
│   │   ├── models/            # Data models (optional, using raw SQL)
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── prisma/
│   │   └── schema.sql         # Database schema (MySQL)
│   ├── .env.example           # Environment variables template
│   └── package.json
│
├── frontend/                   # Frontend (React)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── context/           # React Context (Auth, etc.)
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       │   ├── auth/          # Login, Register, Forgot Password
│       │   ├── dashboard/     # Main dashboard
│       │   ├── corehr/        # Core HR module
│       │   ├── attendance/    # Attendance module
│       │   ├── leave/         # Leave management
│       │   ├── payroll/       # Payroll processing
│       │   ├── compliance/    # BPJS, PPh21, Pension
│       │   ├── ess/           # Employee Self Service
│       │   ├── asset/         # Asset management
│       │   ├── training/      # Training module
│       │   └── reports/       # Reports & analytics
│       ├── services/          # API service layer
│       ├── utils/             # Helper functions
│       ├── App.js             # Main app component
│       └── index.js           # Entry point
│   └── package.json
│
└── readme.md                  # This file
```

## 🚀 Fitur Utama

### 1. Modul Utama
- ✅ **Core HR**: Struktur organisasi, position/job role, employee onboarding, document management
- ✅ **Attendance**: Check in/out (biometric/GPS), shift & schedule, overtime tracking
- ✅ **Leave Management**: Apply → approval workflow, leave types, balance tracking
- ⏳ **Payroll**: Master salary, transaksi, proses, approval multi-level
- ⏳ **Compliance**: BPJS Kesehatan, BPJS Ketenagakerjaan, PPh21, Pension
- ⏳ **ESS**: View profile/payslip, apply leave, cek attendance
- ⏳ **Asset Management**: Asset tracking, maintenance schedule
- ⏳ **Training**: Program, enrollment, evaluation, sertifikat
- ⏳ **Notification Engine**: Multi-channel notifications + audit trail

### 2. User Roles & Permission
- Administrator (Full Access)
- HR Staff (HR operations)
- Manager (Approval rights)
- Employee (Self-service)
- Finance/Payroll (Payroll processing)
- Director (Executive approvals)

### 3. Database Schema
Schema MySQL lengkap tersedia di `backend/prisma/schema.sql` mencakup:
- Multi-company & multi-branch support
- Employee master data & history
- Attendance & scheduling
- Leave management
- Payroll processing
- Compliance (BPJS, PPh21)
- Asset management
- Training programs
- Notification & approval workflows

## 🛠️ Setup & Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dan sesuaikan konfigurasi database

# Create database dan run schema
mysql -u root -p < prisma/schema.sql

# Start server (development)
npm run dev

# Start server (production)
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Server akan berjalan di:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## 🔐 Default Credentials (Demo)

| Role | Username | Password |
|------|----------|----------|
| Administrator | admin | admin123 |
| HR Staff | hrstaff | hr123 |
| Manager | manager | mgr123 |
| Employee | employee | emp123 |
| Finance | finance | fin123 |
| Director | director | dir123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Employees (Placeholder)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance (Placeholder)
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out

## 📊 Development Status

| Module | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Auth & RBAC | ✅ | ✅ | Complete |
| Dashboard | ⏳ | ✅ | Frontend Ready |
| Core HR | ⏳ | ⏳ | In Progress |
| Attendance | ⏳ | ⏳ | In Progress |
| Leave | ⏳ | ⏳ | In Progress |
| Payroll | ⏳ | ⏳ | Planned |
| Compliance | ⏳ | ⏳ | Planned |
| ESS | ⏳ | ⏳ | Planned |
| Asset | ⏳ | ⏳ | Planned |
| Training | ⏳ | ⏳ | Planned |
| Reports | ⏳ | ⏳ | Planned |

## 🏗️ Arsitektur Deployment

```
Load Balancer
    ↓
App Server (Node.js/Express + PM2)
    ↓
DB Server (MySQL Primary + Replica)
```

Dengan:
- Monitoring & Logging
- Backup & Recovery
- Firewall & HTTPS
- Rate Limiting
- CORS Protection

## 📝 Next Steps

1. ✅ Setup project structure (DONE)
2. ✅ Database schema (DONE)
3. ✅ Authentication & Authorization (DONE)
4. ⏳ Implement Core HR module
5. ⏳ Implement Attendance module
6. ⏳ Implement Leave Management
7. ⏳ Implement Payroll (master → transaksi → proses → approval)
8. ⏳ Implement Compliance (BPJS/PPh21/Pension)
9. ⏳ Implement ESS, Asset, Training
10. ⏳ Implement Notification engine + Dashboard/Reporting

## 📄 License

Proprietary - All rights reserved

---

**HRIS Payroll Enterprise System** © 2024
