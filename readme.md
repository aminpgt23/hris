# PROMPT — HRIS Payroll Enterprise System

Buatkan sistem **HRIS Payroll Enterprise** (multi-company, multi-branch) dengan tech stack:
- Frontend: **React** (component-based, responsive)
- Backend: **Node.js + Express**
- Database: **MySQL**
- Auth: JWT + role-based access control

## 1. Modul Utama
- **Core HR**: struktur organisasi, position/job role, employee onboarding, document management, employee history
- **Attendance**: check in/out (biometric/GPS), shift & schedule, overtime tracking, laporan (daily/monthly/exception)
- **Leave Management**: apply → approval (manager→HR) → update balance; tipe cuti (annual, sick, personal, maternity, others); leave calendar
- **Payroll**:
  - Master: salary component, structure & grade, employee assignment
  - Transaksi: attendance, overtime, leave adjustment, allowance, deduction/loan
  - Proses: initialization → calculation → simulation → result → payslip/report/journal/bank export
  - Approval: multi-level (Manager → HR → Finance → Director), status pending/approved/rejected/revision
- **Compliance**: BPJS Kesehatan, BPJS Ketenagakerjaan, PPh21, Pension — kalkulasi otomatis + export laporan
- **Employee Self Service (ESS)**: view profile/payslip, apply leave, cek attendance, update profile
- **Asset Management**: asset master, assignment, tracking, maintenance schedule, disposal
- **Training**: program, schedule, enrollment, evaluation, sertifikat
- **Notification & Approval Engine**: trigger otomatis (leave request, payroll created, overtime, dll) → multi-channel (in-app, email, WA/SMS, push) + audit trail log

## 2. User Roles & Permission
Administrator, HR Staff, Manager, Employee, Finance/Payroll, Director — dengan matrix akses: Full Access / Limited Access / View Only / No Access per modul.

## 3. Database (ERD level tinggi)
Entitas inti: `employee`, `attendance`, `leave`, `payroll`, `compliance`, `asset`, `training`, `user/system`.
Contoh relasi kunci:
- `employee_id (PK)` → organization & employee master (grade, location, document)
- `attendance_id (FK employee_id)` → schedule, shift, overtime, holiday
- `leave_id (FK employee_id)` → leave type, balance, approval status
- `payroll_id (FK employee_id)` → payroll master & transaction, allowance/deduction, tax
- `compliance` → BPJS, PPh21, pension (relasi ke payroll)
- `asset_id (FK employee_id)` → assignment & maintenance
- `training_id (FK employee_id)` → participant & evaluation
- `system` → user, role, permission, audit log

## 4. UI/UX
- Navigasi: Login → Dashboard → Master / Transaction / Report / Setting (tiap modul punya List, Detail, Form, Report)
- Dashboard utama menampilkan: headcount trend, attendance summary, leave summary, payroll cost — mendukung drill-down ke detail
- Wireframe yang dibutuhkan: Dashboard (admin/HR), Employee Profile, Attendance, Payroll Process, Reporting Dashboard (chart-based)
- Desain bersih, modern, dashboard-style, mendukung mobile (untuk ESS)

## 5. API & Integrasi Eksternal
REST API + API Gateway (auth, rate limiting, monitoring). Integrasi: biometric device, GPS/geo-location, payment/bank gateway, e-filing BPJS/PPh21, email/SMS/WA gateway.

## 6. Deployment
Arsitektur: Load Balancer → App Server (Node/Express, PM2) → DB Server (MySQL primary + backup) — dengan monitoring, logging, backup & recovery, firewall/HTTPS.

---

## Instruksi untuk Qwen Coder
Bangun secara bertahap (jangan sekaligus), urutan prioritas:
1. Setup project (folder structure React + Express + MySQL schema dasar) + auth & role permission
2. Modul Core HR + Attendance
3. Modul Leave Management
4. Modul Payroll (master → transaksi → proses → approval)
5. Compliance (BPJS/PPh21/Pension)
6. ESS, Asset, Training
7. Notification engine + Dashboard/Reporting

Untuk tiap tahap: buatkan schema MySQL, REST API endpoint (CRUD + business logic), dan komponen React terkait. Konfirmasi struktur folder & schema dulu sebelum lanjut ke modul berikutnya.
