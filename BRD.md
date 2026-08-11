# BRD — HRIS Payroll Enterprise System

**Business Requirements Document (BRD)**

| | |
|---|---|
| **Nama Sistem** | Human Resource Information System (HRIS) Payroll Enterprise |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 10 Agustus 2026 |
| **Status** | Final |
| **Dokumen Penyusun** | Tim Pengembang (Cerberus / OhMyOpenCode) |
| **Repo** | https://github.com/aminpgt23/hris |

---

## 1. Ringkasan Eksekutif

Sistem **HRIS Payroll Enterprise** adalah aplikasi manajemen sumber daya manusia berbasis web (React + Node.js + MySQL) yang mencakup seluruh siklus HR: master data karyawan, absensi berbasis wajah & GPS, manajemen cuti dengan workflow persetujuan bertingkat, penggajian dengan perhitungan pajak PPh21 (TER & Pasal 17), kepatuhan BPJS/Pensiun, aset, pelatihan, laporan, serta self-service karyawan. Sistem mendukung **multi-perusahaan & multi-cabang**, **RBAC** (Role-Based Access Control) dengan 6 peran, **tema terang/gelap**, dan **bahasa Indonesia/Inggris**.

---

## 2. Tujuan Bisnis

1. **Digitalisasi proses HR** — menggantikan proses manual (pencatatan absensi kertas, form cuti, perhitungan gaji spreadsheet) menjadi satu sistem terpusat.
2. **Akurasi penggajian** — perhitungan otomatis sesuai regulasi Indonesia: PPh21 (PMK 168/2023 TER & Pasal 17 UU HPP), BPJS Kesehatan/Ketenagakerjaan, dan iuran pensiun.
3. **Kontrol & akuntabilitas** — setiap keputusan (approval cuti, perubahan data) tercatat melalui workflow approval dan audit log.
4. **Self-service karyawan** — karyawan mengajukan cuti, melihat payslip, profil, dan absensi sendiri tanpa perantara HR.
5. **Efisiensi manajemen** — dashboard role-aware, laporan siap ekspor (PDF/Excel), dan notifikasi multi-channel.

---

## 3. Lingkup Sistem

### 3.1 In Scope
- Autentikasi & otorisasi (login, refresh token, RBAC, lockout akun)
- Master data (perusahaan, cabang, departemen, posisi, grade, shift, hari libur)
- Core HR (karyawan, dependents, pendidikan, pengalaman, dokumen, riwayat gaji)
- Absensi (check-in/out dengan **wajib foto selfie + deteksi wajah + geolokasi**, riwayat dengan bukti foto/lokasi, shift, jadwal, lembur)
- Cuti/Leave (jenis cuti, saldo, pengajuan, **workflow persetujuan 2 tingkat**, pembatalan)
- Approval (menu persetujuan cuti berbasis peran)
- Payroll (periode, komponen gaji, assignment gaji, **perhitungan PPh21 TER/Pasal 17**, summary, payslip)
- Compliance (konfigurasi BPJS Kesehatan, BPJS Ketenagakerjaan, Pensiun, tarif pajak)
- ESS (profil karyawan, edit profil, payslip read-only)
- Manajemen Aset (kategori, aset, penugasan)
- Pelatihan (program, sesi, enrollmen)
- Notifikasi (in-app)
- Laporan (8 jenis laporan + ekspor PDF/Excel)
- Help Center (panduan, FAQ, dukungan, dokumentasi)
- Master Data & System Settings (khusus Administrator)
- Dashboard role-aware (Employee / Manager / Executive)

### 3.2 Out of Scope
- Integrasi perangkat biometrik fisik (config tersedia, belum aktif penuh)
- Payment gateway / transfer bank otomatis (struktur data tersedia)
- Mobile native app (menggunakan responsive web)
- Modul gaji terintegrasi penuh dengan akuntansi (jurnal masih skema)

---

## 4. Peran Pengguna & Hak Akses

| Peran | Hak Akses Utama |
|---|---|
| **Administrator** | Akses penuh seluruh menu, termasuk Master Data & System Settings |
| **HR Staff** | Core HR, Attendance, Leave, Approvals, Payroll, Compliance, Reports |
| **Manager** | Dashboard, Team Attendance, Team Leave, Approvals (hanya timnya), Reports, Team Profile |
| **Employee** | Dashboard, My Profile (ESS), Attendance, Apply Leave, My Payslip, My Assets, Training, Notifications |
| **Finance** | Dashboard, Payroll Process, Payroll Approval, Payslips, Reports, Bank Export |
| **Director** | Dashboard, Payroll Approval, Compliance, Reports |

### 4.1 Kredensial Demo

| Role | Username | Password |
|---|---|---|
| Administrator | admin | admin123 |
| HR Staff | hrstaff | hr123 |
| Manager | manager | mgr123 |
| Employee | employee | emp123 |
| Finance | finance | fin123 |
| Director | director | dir123 |

---

## 5. Alur Proses Bisnis Utama

### 5.1 Workflow Persetujuan Cuti (Leave Approval)

```
KARYAWAN                          MANAGER                        HR STAFF
    │                                │                               │
    │ submit request                 │                               │
    │ status: Pending Manager ──────►│ approve/reject                │
    │                                │  ├─ Reject → selesai          │
    │                                │  └─ Approve: Pending HR ─────►│ approve/reject
    │                                │                               │  ├─ Reject → selesai
    │                                │                               │  └─ Approve: Approved
    │                                │                               │     (saldo cuti dikurangi)
```

**Aturan kunci:**
1. **Employee** membuat request → status `Pending Manager` → menunggu persetujuan **supervisor langsung** (atasan).
2. **Manager** hanya dapat melihat & menyetujui request **timnya sendiri** (`supervisor_id`); request di luar tim → 403.
3. **Manager tidak dapat menyetujui/menolak request miliknya sendiri** (request sendiri menunggu atasan manager).
4. **Pending HR** untuk Manager bersifat **informasi saja** (tanpa tombol aksi); hanya HR Staff/Admin yang dapat menyetujui di tahap ini.
5. **HR Staff** menyetujui `Pending HR` → status `Approved` → **saldo cuti otomatis berkurang**.
6. Manager melihat request **tim + request miliknya sendiri** (masing-masing di tahap sesuai statusnya).
7. Pembatalan (`Cancelled`) hanya dapat dilakukan oleh pemilik request selama status belum `Approved/Rejected/Cancelled`.
8. Reject pada tahap Manager/HR dapat disertai alasan (`rejection_reason`).

### 5.2 Alur Absensi (Wajib Foto + GPS)

```
Karyawan klik Check In
    → Modal kamera (FaceCaptureModal)
        → deteksi wajah (face-api.js, self-healing loop)
        → kunci koordinat GPS (navigator.geolocation)
    → submit method='Face' + foto + lat/lng + nama lokasi
    → backend simpan bukti foto & geolokasi
    → riwayat absensi menampilkan foto (zoom) + link Google Maps
```

### 5.3 Alur Penggajian

```
Setup master: komponen gaji, periode payroll, assignment gaji
    → Pilih karyawan (prefill dari DB)
    → Hitung: gaji pokok + tunjangan - potongan
        → BPJS Kesehatan (Karyawan 1% / Perusahaan 4%)
        → BPJS Ketenagakerjaan (JHT 2%/3.7%, JP 1%/2%, JKK, JKM)
        → Pensiun (Karyawan 1% / Perusahaan 2%)
        → PPh21: metode TER (PMK 168/2023) ATAU Pasal 17 progresif
    → Output: take-home pay, employer cost, cost to company
```

---

## 6. Kebutuhan Fungsional per Modul

### 6.1 Autentikasi & Otorisasi (AUTH)
| ID | Kebutuhan | Status |
|---|---|---|
| AUTH-01 | Login dengan username/email + password (bcrypt) | ✅ |
| AUTH-02 | JWT access token + refresh token | ✅ |
| AUTH-03 | Logout (audit tercatat) | ✅ |
| AUTH-04 | Ganti password (min. 8 karakter, verifikasi password lama) | ✅ |
| AUTH-05 | Lockout akun setelah 5x gagal login (30 menit) | ✅ |
| AUTH-06 | RBAC: role-based route guard di frontend & middleware backend | ✅ |
| AUTH-07 | Profil pengguna (getProfile) | ✅ |
| AUTH-08 | Login mobile: logo tampil di atas form, tanpa card | ✅ |
| AUTH-09 | Login response menyertakan `employeeId` untuk identifikasi kepemilikan data | ✅ |

### 6.2 Dashboard
| ID | Kebutuhan | Status |
|---|---|---|
| DASH-01 | Dashboard role-aware: Employee / Manager / Executive | ✅ |
| DASH-02 | Statistik absensi (Present, Absent, Late, WFH) hari ini | ✅ |
| DASH-03 | Statistik kehadiran bulan ini | ✅ |
| DASH-04 | Informasi cuti menunggu approval (manager) | ✅ |

### 6.3 Core HR (Karyawan & Organisasi)
| ID | Kebutuhan | Status |
|---|---|---|
| HR-01 | CRUD karyawan (create/edit/delete/deactivate) dengan form modal | ✅ |
| HR-02 | Data personal, kontak, identitas (KTP, NPWP, BPJS), bank | ✅ |
| HR-03 | Status kerja: Permanent, Contract, Probation, Intern, Outsource | ✅ |
| HR-04 | Struktur organisasi (Department Tree) | ✅ |
| HR-05 | Struktur atasan-bawahan (`supervisor_id`) — dasar filter approval | ✅ |
| HR-06 | Struktur data dependents, pendidikan, pengalaman, dokumen, riwayat gaji (skema) | ✅ (skema DB) |
| HR-07 | Pencarian karyawan di topbar (search global → Core HR) | ✅ |
| HR-08 | Master Data: Companies, Branches, Departments, Positions, Grades, Shifts, Holidays (khusus Admin) | ✅ |
| HR-09 | Akses Core HR: Administrator, HR Staff, Manager (Team Profile) | ✅ |

### 6.4 Absensi (Attendance)
| ID | Kebutuhan | Status |
|---|---|---|
| ATT-01 | Check-in & check-out dengan **wajib foto selfie + deteksi wajah + GPS** | ✅ |
| ATT-02 | Modal kamera (FaceCaptureModal) dengan self-healing script loading | ✅ |
| ATT-03 | Quick check-in/out mode Web (opsional) | ✅ |
| ATT-04 | Status absensi: Present, Absent, Late, Half Day, WFH, On Leave | ✅ |
| ATT-05 | Riwayat menampilkan **foto check-in/out** (thumbnail → modal zoom + detail waktu/lokasi) | ✅ |
| ATT-06 | **Link Google Maps** untuk geolokasi check-in/out | ✅ |
| ATT-07 | Filter status (All/Present/Late/Absent) + pencarian karyawan | ✅ |
| ATT-08 | Statistik harian (Present/Absent/Late/WFH) | ✅ |
| ATT-09 | Shift, jadwal (schedule), hari libur, lembur (backend ready) | ✅ (backend) |

### 6.5 Cuti (Leave)
| ID | Kebutuhan | Status |
|---|---|---|
| LV-01 | Jenis cuti (Annual, Sick, Personal, Maternity, dll) dengan max/accrual | ✅ |
| LV-02 | Saldo cuti per tahun per karyawan | ✅ |
| LV-03 | Pengajuan cuti (semua peran termasuk **Manager dapat mengajukan**) | ✅ |
| LV-04 | Validasi: tanggal wajib, max hari per request, tabrakan tanggal, saldo cukup | ✅ |
| LV-05 | Workflow 2 tingkat: Pending Manager → Pending HR → Approved | ✅ |
| LV-06 | **Manager melihat tim + request sendiri**; hanya approve request tim | ✅ |
| LV-07 | **Manager tidak bisa approve request sendiri** (menunggu atasan) | ✅ |
| LV-08 | Pending HR untuk manager = informasi saja | ✅ |
| LV-09 | Saldo otomatis berkurang saat HR approve | ✅ |
| LV-10 | Reject dengan alasan; Cancel oleh pemilik | ✅ |
| LV-11 | Role-gated tombol approve/reject; summary card role-aware | ✅ |
| LV-12 | Tab filter: All / Pending Manager / Pending HR / Approved / Rejected | ✅ |

### 6.6 Approval (Menu Persetujuan)
| ID | Kebutuhan | Status |
|---|---|---|
| APP-01 | List request sesuai peran (Manager: tim + sendiri; HR: Pending HR/Manager; Admin: semua) | ✅ |
| APP-02 | **Badge & list konsisten** (stat card dihitung dari data yang benar-benar tampil) | ✅ |
| APP-03 | Aksi approve/reject hanya untuk status yang berhak (Manager: Pending Manager tim) | ✅ |
| APP-04 | Detail modal + modal alasan reject | ✅ |
| APP-05 | Akses: Administrator, HR Staff, Manager, Director | ✅ |

### 6.7 Payroll
| ID | Kebutuhan | Status |
|---|---|---|
| PAY-01 | Master payroll period (CRUD, status: Draft→Initialized→Processing→Simulated→Approved→Paid→Closed) | ✅ |
| PAY-02 | Salary components (Earning/Deduction/Tax/Benefit; Fixed/Variable/Reimbursement/Loan/Tax/BPJS) | ✅ |
| PAY-03 | Employee salary assignments (basic salary, kategori pajak TK0–K3, % BPJS, pensiun) | ✅ |
| PAY-04 | **Perhitungan PPh21 metode TER (PMK 168/2023)** — kategori A/B/C | ✅ |
| PAY-05 | **Perhitungan PPh21 metode Pasal 17 progresif (UU HPP)** | ✅ |
| PAY-06 | **Konfigurasi tarif pajak dari DB** (fallback ke default built-in) | ✅ |
| PAY-07 | Prefill input perhitungan dari DB (gaji, data absensi) | ✅ |
| PAY-08 | Hasil: income, deductions, take-home pay, **employer cost, cost to company** | ✅ |
| PAY-09 | Summary: total employees, total payroll (net), active periods, jumlah komponen | ✅ |
| PAY-10 | **Responsive mobile**: tab scroll horizontal (seperti Attendance), card tidak overflow | ✅ |
| PAY-11 | Akses: Administrator, HR Staff, Finance, Director | ✅ |
| PAY-12 | Payslip (MyPayslip) untuk Employee — read-only | ✅ |
| PAY-13 | Struktur data: transactions, variable items, loans & installments (skema) | ✅ (skema DB) |

### 6.8 Compliance
| ID | Kebutuhan | Status |
|---|---|---|
| CMP-01 | Konfigurasi BPJS Kesehatan (employee 1% / employer 4%, batas) | ✅ |
| CMP-02 | Konfigurasi BPJS Ketenagakerjaan (JHT, JP, JKK, JKM) | ✅ |
| CMP-03 | **Konfigurasi Pensiun dari DB** (employee/employer %, nama dana) | ✅ |
| CMP-04 | Tarif pajak PPh21 (tax rates per tahun, berlapis) | ✅ |
| CMP-05 | **Employer pension masuk ke employer cost** (sebelumnya hilang) | ✅ |
| CMP-06 | Payroll memakai konfigurasi dari DB (fallback default) | ✅ |
| CMP-07 | Laporan kepatuhan (skema: BPJS Health, BPJS Employment, PPh21 Massal, Pension) | ✅ (skema DB) |

### 6.9 ESS (Employee Self Service)
| ID | Kebutuhan | Status |
|---|---|---|
| ESS-01 | Lihat & **edit profil sendiri** (modal edit profil) | ✅ |
| ESS-02 | Quick actions: Check In (wajib foto+GPS), Apply Leave | ✅ |
| ESS-03 | My Payslip read-only (halaman terpisah, bukan modul payroll penuh) | ✅ |
| ESS-04 | Data kontak, alamat, bank, kontak darurat | ✅ |
| ESS-05 | Akses: Employee (default), semua peran | ✅ |

### 6.10 Manajemen Aset
| ID | Kebutuhan | Status |
|---|---|---|
| AST-01 | CRUD aset (kategori, nomor aset, kondisi, biaya) | ✅ |
| AST-02 | Penugasan aset ke karyawan (`PUT /:id/assign`) | ✅ |
| AST-03 | Kategori aset + maintenance (skema DB) | ✅ (skema DB) |

### 6.11 Pelatihan (Training)
| ID | Kebutuhan | Status |
|---|---|---|
| TRN-01 | CRUD program pelatihan (Internal/External/Online/Workshop/Seminar/Certification) | ✅ |
| TRN-02 | CRUD sesi pelatihan (status: Planned→Open→Full→InProgress→Completed→Cancelled) | ✅ |
| TRN-03 | Enroll karyawan (Nominated→Registered→Confirmed→Completed) | ✅ |
| TRN-04 | Restriksi CRUD: **khusus Admin/HR** | ✅ |

### 6.12 Notifikasi
| ID | Kebutuhan | Status |
|---|---|---|
| NOT-01 | List notifikasi in-app per user | ✅ |
| NOT-02 | Tandai satu / semua dibaca | ✅ |
| NOT-03 | Dropdown notifikasi di topbar (mobile: full-width panel) | ✅ |
| NOT-04 | Template notifikasi (email/SMS/WA/Push) + riwayat status (skema DB) | ✅ (skema DB) |

### 6.13 Laporan (Reports)
| ID | Kebutuhan | Status |
|---|---|---|
| RPT-01 | Employee Summary (PDF) | ✅ |
| RPT-02 | Payroll Summary (Excel) | ✅ |
| RPT-03 | Attendance Report (PDF) | ✅ |
| RPT-04 | Leave Analysis (Excel) | ✅ |
| RPT-05 | Headcount Report (PDF) | ✅ |
| RPT-06 | BPJS Report, PPh21 Report, Overtime Report | ✅ |
| RPT-07 | Simpan laporan (saved reports) | ✅ |
| RPT-08 | Dashboard stats / headcount / payroll cost / team stats | ✅ |
| RPT-09 | Akses: Administrator, HR Staff, Manager, Finance, Director | ✅ |

### 6.14 Help Center
| ID | Kebutuhan | Status |
|---|---|---|
| HLP-01 | Panduan penggunaan (guide) | ✅ |
| HLP-02 | Dukungan (support) | ✅ |
| HLP-03 | FAQ | ✅ |
| HLP-04 | Dokumentasi (docs) | ✅ |
| HLP-05 | Daftar SK aktif (active SK list) | ✅ |

### 6.15 Master Data & System Settings
| ID | Kebutuhan | Status |
|---|---|---|
| MST-01 | Master Data: Companies, Branches, Departments, Positions, Grades, Shifts, Holidays (CRUD, khusus Admin) | ✅ |
| SYS-01 | System Settings (khusus Administrator, route `/system/*`) | ✅ |

### 6.16 Fungsionalitas Lintas Modul
| ID | Kebutuhan | Status |
|---|---|---|
| X-01 | **Tema terang/gelap** (ThemeContext, toggle di topbar) | ✅ |
| X-02 | **Bahasa Indonesia/Inggris** (LanguageContext, toggle di topbar) | ✅ |
| X-03 | Search karyawan global di topbar (⌘K / Ctrl+K) | ✅ |
| X-04 | Responsive: sidebar mobile, bottom nav, mobile card view pada tabel | ✅ |
| X-05 | Toast notification feedback | ✅ |
| X-06 | Rebranding "HRIS System" → "Human Resource", logo.png di seluruh brand | ✅ |
| X-07 | **Header mobile**: jarak antar tombol (search, bahasa, dark mode) diperbaiki | ✅ |

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Kinerja** | Tabel menggunakan sticky header + max height; pagination limit (50) pada API list |
| **Keamanan** | Password bcrypt; JWT + refresh; RBAC di frontend & backend; audit log; lockout akun; validasi input; verifikasi kepemilikan data (403 untuk akses non-tim) |
| **Usability** | Responsive mobile-first; mobile card view pada tabel; tab scroll horizontal di mobile; dark mode; multi-bahasa |
| **Reliabilitas** | Face recognition self-healing loop; fallback konfigurasi default saat DB kosong; error handling dengan pesan jelas |
| **Data** | MySQL, foreign keys + index, ENUM untuk status, JSON untuk data fleksibel, views untuk reporting |
| **Kompatibilitas** | Browser modern; mobile device (kamera + GPS) |

---

## 8. Arsitektur Sistem

```
┌──────────────────────────────────────────────┐
│  Frontend (React 18 + CRA)                   │
│  ├── Layout: Sidebar, Topbar, BottomNav       │
│  ├── Modules: Dashboard, Core HR, Attendance, │
│  │   Leave, Approvals, Payroll, Compliance,   │
│  │   ESS, Asset, Training, Reports, Help      │
│  ├── Context: Auth, Theme, Language, Toast    │
│  └── UI Kit: Card, Table, Badge, Button, Modal│
└──────────────────┬───────────────────────────┘
                   │ REST API (JSON, JWT)
┌──────────────────▼───────────────────────────┐
│  Backend (Node.js + Express)                 │
│  ├── Middleware: auth, RBAC, error handler    │
│  ├── Modules: auth, core-hr, attendance,      │
│  │   leave, payroll, compliance, ess, asset,  │
│  │   training, notification, reports, help     │
│  └── PPh21 engine (TER + Pasal 17)            │
└──────────────────┬───────────────────────────┘
                   │ mysql2/promise
┌──────────────────▼───────────────────────────┐
│  MySQL (hris_payroll_db)                     │
│  ~45 tabel + views reporting + seed data     │
└──────────────────────────────────────────────┘
```

### 8.1 Teknologi
- **Frontend**: React 18, React Router, Material UI Icons, face-api.js (deteksi wajah), CSS variables
- **Backend**: Node.js, Express, mysql2 (pool), bcryptjs, jsonwebtoken, uuid
- **Database**: MySQL 8 (multi-company, multi-branch)
- **Deployment**: Load balancer → App server (PM2) → DB (primary + replica)

---

## 9. API Endpoints (Ringkasan)

### Auth
`POST /api/auth/login`, `POST /api/auth/refresh-token`, `POST /api/auth/logout`, `POST /api/auth/change-password`, `GET /api/auth/profile`

### Core HR / Master Data
`GET|POST|PUT|DELETE /api/companies`, `GET /api/employees`, `GET|POST|PUT /api/employees/:id`, routes department/position/organization

### Attendance
`GET /api/attendance`, `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/summary/daily`, routes shift/schedule/holiday/overtime

### Leave
`GET /api/leave/requests`, `POST /api/leave/requests`, `PUT /api/leave/requests/:id/approve-manager`, `PUT /api/leave/requests/:id/approve-hr`, `PUT /api/leave/requests/:id/reject`, `PUT /api/leave/requests/:id/cancel`, `GET /api/leave/balances`, `GET /api/leave/types`

### Payroll
`GET|POST|PUT|DELETE /api/payroll/periods`, `.../salary-components`, `.../assignments`, `GET /api/payroll/employees`, `GET /api/payroll/summary`, `GET /api/payroll/calculation-inputs/:employeeId`, `POST /api/payroll/calculate`, `GET /api/payroll/periods/:id/transactions`

### Compliance
`GET|POST /api/compliance/bpjs-health`, `.../bpjs-employment`, `.../pension`, `.../tax-rates`

### ESS
`GET|PUT /api/ess/profile`, `GET /api/ess/payslips`, `GET /api/ess/dashboard`

### Lainnya
Asset `GET|POST /api/asset`, `PUT /api/asset/:id/assign`; Training `.../programs`, `.../sessions`, `POST /api/training/enroll`, `.../enrollments`; Notification `GET /`, `PUT /:id/read`, `PUT /read-all`; Reports `GET /dashboard/*`, `GET /generate/*`, `GET|POST|DELETE /saved`

---

## 10. Struktur Data Utama (Ringkasan)

| Area | Tabel |
|---|---|
| Sistem | companies, branches, departments, positions, grades, roles, users, audit_logs |
| Core HR | employees, employee_dependents, employee_education, employee_work_experience, employee_documents, employee_salary_history |
| Absensi | shifts, holidays, schedules, attendance_records, overtime_requests |
| Cuti | leave_types, leave_balances, leave_requests, leave_adjustments |
| Payroll | salary_components, payroll_periods, employee_salary_assignments, payroll_transactions, payroll_variable_items, employee_loans, loan_installments |
| Compliance | bpjs_health_config, bpjs_employment_config, tax_rates, pension_config, pph21_calculations, compliance_reports |
| Aset | asset_categories, assets, asset_maintenance |
| Pelatihan | training_programs, training_sessions, training_enrollments |
| Notifikasi | notification_templates, notifications, approval_workflows, approval_history |
| Views | v_employee_summary, v_attendance_daily_summary, v_leave_balance_current, v_payroll_period_summary |

---

## 11. Kriteria Penerimaan (Acceptance Criteria — untuk skenario utama)

### Skenario 1: Cuti karyawan → Manager → HR
1. Employee (Rudi) login → Apply Leave → submit request.
2. Status request = `Pending Manager`; badge Approvals Manager bertambah.
3. Manager (atasan Rudi) login → menu Approvals menampilkan request tersebut (list TIDAK kosong, konsisten dengan badge).
4. Manager klik Approve → status `Pending HR`; tombol aksi hilang untuk Manager (info saja).
5. HR Staff login → Approvals → Approve → status `Approved`; saldo cuti Rudi berkurang.

### Skenario 2: Cuti Manager (request sendiri)
1. Manager (Ahmad) login → Apply Leave → submit.
2. Request tampil di menu Approvals/Leave miliknya pada tahap `Pending Manager` **tanpa tombol approve/reject** (tidak bisa self-approve).
3. Atasan Manager (supervisor-nya, mis. Admin) approve → `Pending HR`.
4. HR approve → `Approved`.

### Skenario 3: Cuti di luar tim
1. Manager A mencoba approve request milik karyawan di luar timnya → backend menolak (403), data tidak tampil.

### Skenario 4: Absensi dengan bukti
1. Karyawan Check In → modal kamera muncul → foto wajah terdeteksi → GPS terkunci → submit.
2. Riwayat absensi menampilkan foto check-in (klik → zoom + detail) dan link Google Maps.

### Skenario 5: Perhitungan gaji
1. Finance/Admin buka Payroll → tab Calculation.
2. Pilih karyawan → data ter-prefill dari DB → klik Calculate.
3. Hasil menampilkan income, deductions, take-home pay, employer cost, cost to company sesuai PPh21 TER/Pasal 17.

### Skenario 6: Responsive mobile
1. Buka Payroll di device mobile → halaman **tidak bisa scroll ke kanan**; tab dapat digeser horizontal di dalam bar.
2. Buka header mobile → tombol search, ganti bahasa, dark mode **tidak menempel** (ada jarak).

---

## 12. Risiko & Asumsi

| Risiko/Asumsi | Mitigasi |
|---|---|
| Deteksi wajah bergantung pada library pihak ketiga (face-api.js) | Self-healing loading, fallback submit manual |
| Akurasi PPh21 bergantung pada konfigurasi DB | Fallback ke tarif default built-in jika DB kosong; konfigurasi dapat diperbarui via UI Compliance |
| Data demo (Rudi → supervisor Dewi, dst.) menentukan hasil filter tim | Verifikasi supervisor_id saat membuat user/employee |
| Perangkat tanpa GPS/kamera | Quick check-in mode Web tetap tersedia (opsional) |

---

## 13. Riwayat Perubahan (Git History Ringkas)

| Commit | Fitur |
|---|---|
| `0a838f5` | Role-scoped leave approval (manager hanya tim), foto+GPS attendance history, ESS check-in wajib foto+GPS, login mobile |
| `8607a06` | Manager lihat request sendiri + Pending HR info di Approvals, sembunyikan aksi request sendiri, employeeId di login, spacing header mobile |
| `62ea123` | Payroll mobile: tab scroll horizontal ala Attendance, summary card tidak overflow |
| Sebelumnya | RBAC hardening, Help center + EN/ID, pension config, payroll PPh21 TER/Pasal 17, payroll DB-driven, face recognition attendance, employee CRUD, approvals page, notification dropdown mobile |

---

*Dokumen ini mencakup seluruh modul yang sudah diimplementasikan beserta struktur data, alur proses, dan kriteria penerimaan sistem HRIS Payroll Enterprise.*
