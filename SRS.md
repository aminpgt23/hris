# SRS — Software Requirements Specification
## HRIS Payroll Enterprise System

**Software Requirements Specification (SRS)** — mengacu pada IEEE 830-1998

| | |
|---|---|
| **Nama Sistem** | Human Resource Information System (HRIS) Payroll Enterprise |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 10 Agustus 2026 |
| **Status** | Final (disusun dari implementasi aktual) |
| **Dokumen Terkait** | BRD.md (Business Requirements Document) |
| **Repo** | https://github.com/aminpgt23/hris |

---

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen ini menspesifikasikan kebutuhan **fungsional dan non-fungsional** sistem HRIS Payroll Enterprise secara teknis: behavior sistem, aturan bisnis yang diimplementasikan di kode, kontrak API, model data, dan persyaratan kualitas. Dokumen ini menjadi acuan untuk pengembangan lanjutan, pengujian (QA), dan pemeliharaan.

### 1.2 Lingkup
Sistem mencakup: autentikasi & RBAC, master data, core HR, absensi (wajib foto + GPS), cuti dengan approval 2 tingkat, approval, payroll (PPh21 TER/Pasal 17), compliance (BPJS/Pensiun/Pajak), ESS, aset, pelatihan, notifikasi, laporan, help center, dan system settings.

### 1.3 Definisi & Singkatan
| Istilah | Definisi |
|---|---|
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token (access + refresh) |
| TER | Tarif Efektif Rata-rata (PPh21, PMK 168/2023) |
| PTKP | Penghasilan Tidak Kena Pajak |
| BPJS | Badan Penyelenggara Jaminan Sosial |
| JHT / JP / JKK / JKM | Jaminan Hari Tua / Pensiun / Kecelakaan Kerja / Kematian |
| ESS | Employee Self Service |
| CRA | Create React App (frontend build) |
| UUID | Universally Unique Identifier |

### 1.4 Referensi
- BRD.md — dokumen kebutuhan bisnis
- `backend/prisma/schema.sql` — skema database (46 tabel)
- Kode sumber: `backend/src/**` dan `frontend/src/**`

### 1.5 Gambaran Umum Dokumen
Seksi 2 (deskripsi keseluruhan), Seksi 3 (requirement fungsional), Seksi 4 (requirement non-fungsional), Seksi 5 (data dictionary), Seksi 6 (spesifikasi API), Seksi 7 (aturan bisnis), Seksi 8 (kriteria pengujian), Seksi 9 (persyaratan pelaporan), Seksi 10 (penutup).

---

## 2. Deskripsi Keseluruhan

### 2.1 Perspektif Produk
Aplikasi web 3-tier: **React 18 (SPA)** ⇄ **REST API (Express)** ⇄ **MySQL 8** (`hris_payroll_db`). Komponen utama:

```
┌─ Frontend (React 18 + CRA, port 3001) ────────────────┐
│ Layout: Sidebar, Topbar (search ⌘K, theme, bahasa),   │
│         BottomNav (mobile)                            │
│ Context: AuthContext, ThemeContext, LanguageContext,  │
│          ToastContext                                 │
│ Modules: Dashboard, Core HR, Attendance, Leave,       │
│          Approvals, Payroll, Compliance, ESS, Asset,  │
│          Training, Reports, Help, MasterData, System   │
│ Services: axios wrapper + JWT interceptor             │
└──────────────────────┬────────────────────────────────┘
                       │ HTTPS / JSON (JWT Bearer)
┌─ Backend (Node.js + Express, port 3000) ──────────────┐
│ Middleware: requestId, auth (JWT), RBAC role guard,   │
│             error handler, rate limit                 │
│ Modules: auth, core-hr, attendance (shift/schedule/   │
│          holiday/overtime), leave, payroll (pph21),   │
│          compliance, ess, asset, training,            │
│          notification, reports, help                  │
│ Utils: mysql2 pool (prepared statements)              │
└──────────────────────┬────────────────────────────────┘
                       │ mysql2/promise (pool)
┌─ MySQL 8 (hris_payroll_db) ───────────────────────────┐
│ 46 tabel + relasi FK + ENUM status + audit_logs      │
└───────────────────────────────────────────────────────┘
```

### 2.2 Fungsi Produk
1. Autentikasi JWT (access 7 hari, refresh 30 hari) dengan lockout akun.
2. RBAC 6 peran dengan route guard frontend + middleware backend.
3. Absensi check-in/out wajib foto selfie + deteksi wajah + geolokasi, status otomatis (Present/Late).
4. Cuti workflow 2 tingkat (Manager → HR) dengan validasi saldo/tabrak/max hari.
5. Payroll: perhitungan PPh21 TER & Pasal 17, employer cost, cost to company.
6. Compliance: BPJS, Pensiun, tarif pajak yang dikonsumsi payroll.
7. ESS: profil, edit profil, payslip read-only.
8. Laporan 8 jenis + ekspor PDF/Excel.
9. Notifikasi in-app, help center, tema, multi-bahasa (ID/EN).

### 2.3 Karakteristik Pengguna
| Pengguna | Karakteristik | Peran |
|---|---|---|
| Administrator | IT/HR senior, kelola sistem | Admin |
| HR Staff | Operasional HR harian | HR Staff |
| Manager | Setujui cuti tim, lihat laporan tim | Manager |
| Employee | Self-service (cuti, absensi, payslip) | Employee |
| Finance | Proses & verifikasi payroll | Finance |
| Director | Persetujuan eksekutif, laporan | Director |

### 2.4 Lingkungan Operasi
- **Client**: Browser modern (Chrome/Edge/Firefox/Safari), perangkat mobile (kamera + GPS untuk absensi)
- **Server**: Node.js ≥ 18, MySQL 8, PM2 (production)
- **Deployment**: Load Balancer → App Server → DB Primary + Replica

### 2.5 Desain & Implementasi Constraints
- Backend menggunakan **prepared statement** (`db.execute`) — anti SQL injection.
- Password di-hash **bcrypt (salt 10)**.
- Frontend dilarang menggunakan `as any` / `@ts-ignore` (type safety).
- Status menggunakan **ENUM MySQL**; timestamp `created_at`/`updated_at` otomatis.
- Pemisahan peran wajib di **dua lapis**: frontend (role guard) dan backend (middleware).

### 2.6 Dokumentasi Pengguna
- Help Center bawaan (guide, support, FAQ, docs, daftar SK).
- README.md (setup & kredensial demo).

---

## 3. Kebutuhan Fungsional

### 3.1 Autentikasi (AUTH)

**AUTH-01 Login**
- Input: `username` (atau email) + `password`.
- Proses: validasi input → cek user (JOIN `roles`, `employees`) → cek lockout → bcrypt compare → reset `failed_login_attempts` → generate access JWT (`7d`) + refresh JWT (`30d`) → insert `audit_logs` (LOGIN).
- Output: `{ token, refreshToken, expiresIn, user: { id, username, email, roleName, employeeId, employeeNumber, permissions[] } }`.
- Error: `400` (kosong), `401` (kredensial salah), `403` (akun terkunci hingga waktu tertentu).

**AUTH-02 Account Lockout**
- Gagal login 5× berturut-turut → set `locked_until = now + 30 menit`, respons `403` "Account locked due to too many failed attempts. Try again in 30 minutes.".
- Login sukses → reset `failed_login_attempts = 0`, `locked_until = NULL`, `last_login_at = NOW()`.

**AUTH-03 Refresh Token**
- Input `refreshToken` → `jwt.verify` → cek user aktif → token baru (`7d`).
- Error: `400` (token kosong), `401` (invalid/expired).

**AUTH-04 Logout**
- Stateless; catat `audit_logs` (LOGOUT), respons `200`.

**AUTH-05 Change Password**
- Validasi: `currentPassword` + `newPassword` wajib; panjang baru ≥ 8.
- Proses: bcrypt compare current → hash baru → update + `must_change_password = FALSE` → audit (CHANGE_PASSWORD).
- Error: `400` (validasi), `401` (current salah), `404` (user tidak ada).

**AUTH-06 Get Profile**
- `GET /api/auth/profile` → data user + role + employee info (join).
- Output: `{ id, username, email, phone, is_active, last_login_at, created_at, role_name, role_display, employee_number, first_name, last_name, photo_url }`.

**AUTH-07 Register User (Admin)**
- Input: `username, email, password, roleId, employeeId?`. Cek duplikat (409). Hash + insert + audit (CREATE).

**AUTH-08 RBAC Guard**
- Backend: middleware memeriksa `req.user.roleName`; akses non-izin → `403`.
- Frontend: `ProtectedRoute` (wajib login) + `RoleRoute` (filter peran) → redirect.

### 3.2 Dashboard (DASH)

**DASH-01 Role-aware Dashboard**
- Employee: statistik pribadi. Manager: statistik tim + cuti menunggu approval. Executive: ringkasan perusahaan.

**DASH-02 Statistik Absensi Harian**
- Agregasi `attendance_records` per status: `Present`, `Absent`, `Late`, `WFH`.

**DASH-03 Statistik Bulanan**
- Jumlah hari hadir/absent/late dalam bulan berjalan.

**DASH-04 Pending Leave Info**
- Menampilkan jumlah request cuti tim berstatus `Pending Manager`/`Pending HR`.

### 3.3 Master Data (MST)

**MST-01 Companies** — CRUD multi-perusahaan (id, code, name, tax id, alamat, kontak, logo).

**MST-02 Branches** — CRUD cabang (company_id FK, code, name, city, address, phone).

**MST-03 Departments** — CRUD departemen (company_id, parent_id, code, name, manager).

**MST-04 Positions** — CRUD jabatan (company_id, department_id, code, title, level, grade_id).

**MST-05 Grades** — CRUD grade/golongan (code, name, level, description).

**MST-06 Shifts** — CRUD shift kerja (company_id, code, name, start_time, end_time, break_start, break_end, is_night_shift).

**MST-07 Holidays** — CRUD hari libur (company_id, name, date, is_recurring, type).

- Akses: **khusus Administrator** (route `/master-data`).

### 3.4 Core HR (HR)

**HR-01 CRUD Karyawan**
- Form modal create/edit: NIK/employee_number, first/last name, gender, birth, marital, religion, alamat, KTP, NPWP, bank (name/account), BPJS (ketenagakerjaan/kesehatan), email, phone, join date, status (Permanent/Contract/Probation/Intern/Resigned/Terminated), position, department, grade, shift, supervisor_id, photo.
- Delete = soft deactivate (`is_active = FALSE`).

**HR-02 Struktur Organisasi**
- Department Tree (parent-child), menampilkan karyawan per departemen.

**HR-03 Supervisor Mapping**
- `employees.supervisor_id` — dasar filter data tim untuk Manager.

**HR-04 Search Karyawan (Topbar)**
- Pencarian global (nama/NIK/email) → navigasi ke Core HR.

**HR-05 Riwayat Karyawan (skema)**
- `employee_dependents`, `employee_education`, `employee_work_experience`, `employee_documents`, `employee_salary_history`.

### 3.5 Absensi (ATT)

**ATT-01 Check-in (wajib bukti)**
- Input: `location_lat, location_lng, location_name, method, device_id, photo`.
- Validasi: user harus punya `employee_id` (400) → cek belum check-in hari ini (409 "Already checked in today").
- Status otomatis: `Present`; jika `lateMinutes > 15` → `Late`. `late_minutes` dihitung dari `schedule.start_time`.
- Insert `attendance_records` (check_in_time, lokasi, method, device_id, photo, status, late_minutes).
- Output: `{ id, status, time }`.

**ATT-02 Check-out**
- Cari record hari ini dengan `check_out_time IS NULL` → 400 jika tidak ada.
- Hitung `work_hours` dari selisih check-in/out. Update kolom check_out + lokasi + method + device_id + photo.

**ATT-03 Deteksi Wajah (Frontend)**
- Modal kamera (FaceCaptureModal) memakai face-api.js; loading self-healing (retry script load).
- Foto wajah terdeteksi → preview → konfirmasi. Fallback: submit tanpa deteksi tetap diperbolehkan (metode Web).

**ATT-04 Geolokasi (Frontend)**
- `navigator.geolocation` → kunci koordinat + reverse-geocode nama lokasi; ditampilkan sebelum submit.

**ATT-05 Get Records**
- Query filter: `date_from, date_to, employee_id, department_id, status`.
- Join: employee (nama, nomor), department, schedule. Output termasuk `check_in_photo`, `check_out_photo`, koordinat, nama lokasi.

**ATT-06 Daily Summary**
- `GET /api/attendance/summary/daily` → `{ present, absent, late, wfh, ... }` per tanggal.

**ATT-07 Monthly Report**
- Agregasi per karyawan: `present_days, absent_days, late_days` + total.

**ATT-08 Shift / Schedule / Holiday / Overtime**
- CRUD shift, jadwal (`schedules`: employee_id, shift_id, date, is_active), hari libur, lembur (`overtime_requests`: status Pending→Approved→Paid).

### 3.6 Cuti (LV)

**LV-01 Create Request**
- Input: `leave_type_id, start_date, end_date, reason, replacement_employee_id?`.
- Validasi berurutan:
  1. Wajib `leave_type_id, start_date, end_date, reason` → 400.
  2. Hitung `total_days = ceil(|end-start| / 86400000) + 1`.
  3. Jenis cuti harus aktif (`is_active = TRUE`) → 400 "Invalid leave type".
  4. `total_days > leave_type.max_days_per_request` → 400 "Maximum N days per request for {name}".
  5. Tabrakan tanggal dengan request aktif (status ≠ Rejected/Cancelled) → 409 "Leave dates overlap".
  6. `closing_balance < total_days` → 400 "Insufficient leave balance".
- Insert status `'Pending Manager'`. Output `201 { id }`.

**LV-02 Get All Requests**
- Filter query: `status, employee_id, date_from, date_to, department_id`.
- Scope peran:
  - **Employee**: hanya `lr.employee_id = req.user.employeeId`.
  - **Manager**: `(e.supervisor_id = req.user.employeeId OR lr.employee_id = req.user.employeeId)` — tim + request sendiri.
  - **Admin/HR/Finance/Director**: semua (tanpa filter scope).
- Join: leave_types, employees, departments, replacement employee.
- Output: `{ id, leave_type_name, color_code, employee_name, employee_number, department_name, replacement_name, status, total_days, ... }`.

**LV-03 Approve Manager**
- **Manager**: wajib verifikasi `e.supervisor_id = req.user.employeeId AND status='Pending Manager'` → selain itu `403 "Not authorized: leave request is not from your team"`.
- Update: `status='Pending HR', manager_approved_by, manager_approved_at, notes`.
- `affectedRows = 0` → 404 "Request not found or wrong status".

**LV-04 Approve HR**
- Ambil request `status IN ('Pending HR','Pending Manager')` → 404 jika tidak ada.
- Update `status='Approved', hr_approved_by, hr_approved_at, notes += comments`.
- **Saldo otomatis**: `leave_balances.taken += total_days; closing_balance -= total_days` (guard `closing_balance >= total_days`).

**LV-05 Reject**
- Manager: verifikasi kepemilikan tim & status `IN ('Pending Manager','Pending HR')` → 403.
- Update `status='Rejected', rejection_reason, hr_approved_by, hr_approved_at`.
- Error 404 jika status sudah diproses.

**LV-06 Cancel (oleh pemilik)**
- `WHERE id=? AND employee_id=? AND status NOT IN ('Approved','Rejected','Cancelled')` → 404 "Cannot cancel this request" jika gagal.
- Update `status='Cancelled', cancelled_by, cancelled_at`.

**LV-07 Get Balances**
- `GET /api/leave/balances?year=N` → join leave_types (name, code, color). Scope: employee sendiri atau `employee_id` param.

**LV-08 Get Leave Types**
- Hanya `is_active = TRUE`, urut nama.

### 3.7 Approval (APP)

**APP-01 Data Scope per Role**
- Manager: tim + sendiri (sama seperti LV-02).
- HR/Admin/Director: semua.

**APP-02 Badge & List Konsisten**
- Stat cards dihitung dari **data yang benar-benar tampil** (`visibleRequests`), bukan seluruh query.
- Manager melihat `Pending Manager` (dapat aksi) + `Pending HR` (info saja).

**APP-03 Aksi Role-gated**
- Manager: approve/reject hanya untuk request tim berstatus `Pending Manager`; **request sendiri tanpa tombol aksi**.
- HR/Admin: approve (Pending HR/Pending Manager) & reject.

**APP-04 UI**
- Kartu request: employee, jenis cuti (color-code), tanggal, durasi, status badge, tombol aksi sesuai peran, modal detail, modal alasan reject.

### 3.8 Payroll (PAY)

**PAY-01 Payroll Periods**
- CRUD: name, period_start, period_end, payment_date, status (Draft → Initialized → Processing → Simulated → Approved → Paid → Closed), `is_active`.

**PAY-02 Salary Components**
- CRUD: name, type (Earning/Deduction/Tax/Benefit), calculation_type (Fixed/Variable/Reimbursement/Loan/Tax/BPJS), amount/rate, is_taxable, is_active.

**PAY-03 Employee Salary Assignments**
- Per karyawan: basic_salary, tax_category (TK0-TK3, K0-K3), BPJS rates, pension %, allowance/deduction items.

**PAY-04 PPh21 TER (PMK 168/2023)**
- Tabel tarif efektif bulanan kategori **A, B, C** (`TER_CATEGORY_A/B/C`) dengan batas atas inklusif + rate %.
- Kategori ditentukan PTKP (`TER_CATEGORY`): A (TK/0), B (K/0, TK/1-3), C (K/1-3, TK/3+).
- `terRate(table, grossMonthly)`: return rate pertama di mana `grossMonthly <= limit`.
- Perhitungan: `tax = grossMonthly × rate%` (bulanan langsung).

**PAY-05 PPh21 Pasal 17 (UU HPP)**
- Progressif tahunan: `[upper_bound_inclusive, rate%]` — 5%/15%/25%/30%/35%.
- Deduksi: **biaya jabatan 5% (maks Rp500.000/bulan)** → annualisasi → **PTKP** (berdasar kategori) → taxable → band progresif.

**PAY-06 Konfigurasi Tarif dari DB**
- `progressiveFromDb(rows)`: baca `tax_rates` (min_income, max_income, tax_rate%) → `[[upper, rate%]]`.
- Fallback: tabel bawaan (`PROGRESSIVE`) jika DB kosong.

**PAY-07 Calculation Inputs**
- `GET /api/payroll/calculation-inputs/:employeeId` → prefill gaji pokok, tunjangan, BPJS, data absensi dari DB.

**PAY-08 Calculate**
- `POST /api/payroll/calculate` → income (pokok + tunjangan + lembur + bonus) − potongan (BPJS karyawan, pensiun karyawan, kasbon, absensi) → net.
- **Employer cost**: iuran BPJS perusahaan (Kesehatan 4%, JHT 3.7%, JP 2%, JKK 0.54%, JKM) + pensiun perusahaan (2%) + PPh21.
- **Cost to company** = net + employer cost.
- Output tersimpan di `payroll_transactions` (+ `pph21_calculations`).

**PAY-09 Summary**
- `GET /api/payroll/summary` → total employees, total payroll (net), active periods, jumlah komponen.

**PAY-10 Payslip**
- `GET /api/ess/payslips` → slip gaji read-only per periode untuk Employee.

**PAY-11 Struktur Pendukung (skema)**
- `payroll_variable_items` (bonus, lembur, insentif), `employee_loans` + `loan_installments` (kasbon cicilan).

**PAY-12 Responsive Mobile**
- Tab halaman dapat discroll horizontal (`.payroll-tabs`, `overflow-x: auto`); kartu summary tidak melebihi viewport (`min-width: 0` + `overflow-wrap: anywhere`). **Larangan: halaman tidak boleh scroll ke kanan.**

### 3.9 Compliance (CMP)

**CMP-01 BPJS Kesehatan** — CRUD config: employee_rate (1%), employer_rate (4%), max_salary_base, effective_date.

**CMP-02 BPJS Ketenagakerjaan** — CRUD config: JHT (2%/3.7%), JP (1%/2%), JKK (rate by risk, 0.54%), JKM (0.3%), max_salary_base.

**CMP-03 Pension** — CRUD config: employee_rate (1%), employer_rate (2%), dana_pensiun_name, effective_date. **Employer pension masuk employer cost.**

**CMP-04 Tax Rates** — CRUD tarif PPh21: min_income, max_income, tax_rate%, year. Dikonsumsi payroll (progressiveFromDb).

**CMP-05 Laporan Kepatuhan (skema)** — `compliance_reports`: jenis (BPJS Health/Employment, PPh21 Massal, Pension), period, status.

### 3.10 ESS (ESS)

**ESS-01 Get Profile** — data profil karyawan lengkap (pribadi, kontak, bank, darurat) untuk pemilik akun.

**ESS-02 Update Profile** — edit field profil sendiri (modal), validasi input, audit.

**ESS-03 My Payslip** — daftar payslip read-only (halaman terpisah dari modul payroll).

**ESS-04 Quick Actions** — Check In (wajib foto+GPS), Apply Leave dari dashboard.

### 3.11 Aset (AST)

**AST-01 CRUD Aset** — kategori, kode/nomor aset, nama, kondisi (Good/Maintenance/Broken/Lost), nilai, tanggal perolehan, lokasi, company_id.

**AST-02 Assign Aset** — `PUT /api/asset/:id/assign` → assign ke employee (assignee, date, note).

**AST-03 Maintenance (skema)** — `asset_maintenance`: tanggal, jenis, biaya, status.

### 3.12 Pelatihan (TRN)

**TRN-01 CRUD Program** — title, code, category (Internal/External/Online/Workshop/Seminar/Certification), description, vendor, cost, status (Planned/Open/Full/InProgress/Completed/Cancelled).

**TRN-02 CRUD Sesi** — program_id, instructor, start/end date, time, location, capacity.

**TRN-03 Enroll** — `POST /api/training/enroll` (karyawan enroll program); status enrollmen (Nominated/Registered/Confirmed/Completed).

**TRN-04 Restriksi** — CRUD program/sesi **khusus Administrator & HR Staff**; enroll untuk Employee.

### 3.13 Notifikasi (NOT)

**NOT-01 List** — `GET /api/notification` → notifikasi per user (type, title, message, is_read, created_at).

**NOT-02 Mark Read** — `PUT /api/notification/:id/read`, `PUT /api/notification/read-all`.

**NOT-03 UI** — dropdown topbar (mobile: panel penuh), badge unread count.

**NOT-04 Skema** — `notification_templates` (channel email/SMS/WA/Push), `notifications` per penerima, `approval_workflows` + `approval_history` (audit approval).

### 3.14 Laporan (RPT)

**RPT-01 s/d RPT-08** — Endpoint generate (PDF/Excel):
| Endpoint | Output |
|---|---|
| `/generate/employee-summary` | PDF — data karyawan per departemen |
| `/generate/payroll-summary` | Excel — ringkasan payroll periode |
| `/generate/attendance` | PDF — rekap absensi |
| `/generate/leave-analysis` | Excel — analisa cuti |
| `/generate/headcount` | PDF — headcount per departemen |
| `/generate/bpjs` | BPJS report |
| `/generate/pph21` | PPh21 massal |
| `/generate/overtime` | Overtime report |

**RPT-09 Saved Reports** — simpan/load/hapus laporan.

**RPT-10 Dashboard Stats** — `/dashboard/stats`, `/dashboard/headcount`, `/dashboard/my-stats`, `/dashboard/team-stats`, `/dashboard/payroll-cost`.

### 3.15 Help Center (HLP)

**HLP-01 Guide** — panduan penggunaan sistem.
**HLP-02 Support** — kontak dukungan.
**HLP-03 FAQ** — pertanyaan umum.
**HLP-04 Docs** — dokumentasi.
**HLP-05 SK List** — daftar surat keputusan aktif.

### 3.16 Lintas Modul (X)

**X-01 Theme** — terang/gelap (CSS variables, toggle di topbar, persist localStorage).

**X-02 Language** — Indonesia/Inggris (toggle topbar; mobile: label disembunyikan, ikon saja).

**X-03 Search Global** — ⌘K/Ctrl+K → pencarian karyawan → navigasi.

**X-04 Responsive** — sidebar mobile, bottom nav, mobile card view pada tabel, tab scroll horizontal.

**X-05 Toast** — notifikasi feedback operasi (sukses/error).

**X-06 Branding** — "Human Resource", logo di seluruh brand (termasuk halaman login mobile).

**X-07 Header Mobile** — jarak antar tombol (search, bahasa, dark mode) ≥ `--space-2`/`--space-3`; `.topbar-lang-label` disembunyikan.

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Kinerja (Performance)
| ID | Requirement |
|---|---|
| NFR-P1 | List API dibatasi pagination (limit 50 default) |
| NFR-P2 | Tabel frontend: sticky header + max-height + scroll internal |
| NFR-P3 | Query menggunakan index pada kolom FK & tanggal (created_at, start_date, employee_id) |
| NFR-P4 | Prepared statement pooling (mysql2 pool) untuk efisiensi koneksi |

### 4.2 Keamanan (Security)
| ID | Requirement |
|---|---|
| NFR-S1 | Password bcrypt (salt factor 10); JWT secret dari env `JWT_SECRET` |
| NFR-S2 | RBAC di backend (middleware) **dan** frontend (route guard) |
| NFR-S3 | Akses data lintas tim → 403 (verifikasi `supervisor_id`/`employee_id`) |
| NFR-S4 | Lockout akun 5× gagal / 30 menit |
| NFR-S5 | Audit log: LOGIN, LOGOUT, CREATE, CHANGE_PASSWORD (+ entity, ip, request_id) |
| NFR-S6 | Validasi input server-side (wajib, format, panjang) sebelum query |
| NFR-S7 | CORS protection, rate limiting, HTTPS (production) |

### 4.3 Usability & Aksesibilitas
| ID | Requirement |
|---|---|
| NFR-U1 | Responsive mobile-first; `mobile-card-view` pada tabel |
| NFR-U2 | Tema terang/gelap konsisten via CSS variables |
| NFR-U3 | Bahasa ID/EN dengan fallback default |
| NFR-U4 | Feedback visual (toast, badge, loading state) setiap operasi |
| NFR-U5 | Status visual dengan color-code (badge leave type, status badge) |

### 4.4 Reliabilitas
| ID | Requirement |
|---|---|
| NFR-R1 | Face-api.js loading self-healing (retry), fallback submit Web |
| NFR-R2 | Konfigurasi compliance fallback ke nilai default jika DB kosong |
| NFR-R3 | Error handler global; pesan error informatif tanpa stack trace |
| NFR-R4 | Idempoten approval: update berdasar status saat ini (guard `WHERE status=...`) |

### 4.5 Maintainability
| ID | Requirement |
|---|---|
| NFR-M1 | Modular: satu folder per modul backend (`src/modules/<modul>`) + routes terpisah |
| NFR-M2 | Komponen frontend reusable (Card, Table, Badge, Button, Modal) |
| NFR-M3 | Enumerasi status via konstanta ENUM DB |
| NFR-M4 | Dokumentasi BRD.md + SRS.md + README.md selalu sinkron |

---

## 5. Data Dictionary (46 Tabel)

### 5.1 Sistem & Keamanan
| Tabel | Kolom Kunci | Keterangan |
|---|---|---|
| `companies` | id, code, name, tax_id, address, phone, email, logo_url | Multi-perusahaan |
| `branches` | id, company_id FK, code, name, city, address, phone | Cabang |
| `departments` | id, company_id, parent_id, code, name, manager_id | Organisasi (tree) |
| `positions` | id, company_id, department_id, code, title, level, grade_id | Jabatan |
| `grades` | id, company_id, code, name, level | Grade/golongan |
| `roles` | id, name, display_name, description, permissions JSON | RBAC |
| `users` | id, username, email, password_hash, role_id FK, employee_id FK, is_active, failed_login_attempts, locked_until, last_login_at, must_change_password | Akun |
| `audit_logs` | id, user_id, action, entity_type, entity_id, ip_address, request_id, created_at | Audit |

### 5.2 Core HR
| Tabel | Kolom Kunci |
|---|---|
| `employees` | id, company_id, employee_number, first_name, last_name, gender, birth_date, marital_status, religion, address, ktp_number, npwp_number, bank_name, bank_account, bpjs_ketenagakerjaan, bpjs_kesehatan, email, phone, join_date, status (Permanent/Contract/Probation/Intern/Resigned/Terminated), position_id, department_id, grade_id, shift_id, supervisor_id, photo_url, is_active |
| `employee_dependents` | employee_id, name, relation, birth_date, is_tax_dependent |
| `employee_education` | employee_id, level, institution, major, graduation_year, gpa |
| `employee_work_experience` | employee_id, company, position, start_date, end_date, description |
| `employee_documents` | employee_id, doc_type, doc_number, file_url, expiry_date |
| `employee_salary_history` | employee_id, effective_date, basic_salary, position_allowance, notes |

### 5.3 Absensi
| Tabel | Kolom Kunci |
|---|---|
| `shifts` | id, company_id, code, name, start_time, end_time, break_start, break_end, is_night_shift |
| `holidays` | id, company_id, name, date, is_recurring, type |
| `schedules` | id, employee_id, shift_id, date, is_active |
| `attendance_records` | id, employee_id, schedule_id, date, check_in_time, check_in_location_lat/lng/name, check_in_method, check_in_device_id, check_in_photo, check_out_* (sama), work_hours, status (Present/Absent/Late/Half Day/WFH/On Leave), late_minutes |
| `overtime_requests` | id, employee_id, date, start_time, end_time, hours, multiplier, reason, status (Pending/Approved/Paid/Rejected) |

### 5.4 Cuti
| Tabel | Kolom Kunci |
|---|---|
| `leave_types` | id, name, code, max_days_per_request, color_code, is_active |
| `leave_balances` | id, employee_id, leave_type_id, year, entitled, taken, adjustment, closing_balance |
| `leave_requests` | id, employee_id, leave_type_id, start_date, end_date, total_days, working_days, reason, replacement_employee_id, status (Pending Manager/Pending HR/Approved/Rejected/Cancelled), manager_approved_by/at, hr_approved_by/at, rejection_reason, cancelled_by/at, notes |
| `leave_adjustments` | id, employee_id, leave_type_id, amount, reason, adjusted_by |

### 5.5 Payroll
| Tabel | Kolom Kunci |
|---|---|
| `salary_components` | id, name, type (Earning/Deduction/Tax/Benefit), calculation_type (Fixed/Variable/Reimbursement/Loan/Tax/BPJS), amount, rate, is_taxable, is_active |
| `payroll_periods` | id, name, period_start, period_end, payment_date, status (Draft/Initialized/Processing/Simulated/Approved/Paid/Closed), is_active |
| `employee_salary_assignments` | id, employee_id, basic_salary, tax_category (TK0-TK3/K0-K3), allowance_ids, deduction_ids, bpjs_*_rate, pension_*_rate |
| `payroll_transactions` | id, period_id, employee_id, component breakdown (JSON/kontainer), income, deductions, take_home_pay, employer_cost, cost_to_company |
| `payroll_variable_items` | id, transaction_id, name, amount, type |
| `employee_loans` | id, employee_id, amount, interest, start_date, end_date, status |
| `loan_installments` | id, loan_id, period_id, principal, interest, due_date, status |
| `pph21_calculations` | id, transaction_id, employee_id, method, tax_category, gross, deduction, ptkp, pkp, tax_amount, effective_rate |

### 5.6 Compliance
| Tabel | Kolom Kunci |
|---|---|
| `bpjs_health_config` | id, employee_rate, employer_rate, max_salary_base, effective_date |
| `bpjs_employment_config` | id, jht_employee/jht_employer, jp_employee/jp_employer, jkk_rate, jkm_rate, max_salary_base |
| `pension_config` | id, employee_rate, employer_rate, dana_pensiun_name, effective_date |
| `tax_rates` | id, min_income, max_income, tax_rate, year |
| `compliance_reports` | id, report_type, period, generated_by, file_url, status |

### 5.7 Aset, Training, Notifikasi
| Tabel | Kolom Kunci |
|---|---|
| `asset_categories` | id, company_id, name, code |
| `assets` | id, category_id, company_id, asset_code, name, condition, value, purchase_date, location, assigned_to, assigned_at |
| `asset_maintenance` | id, asset_id, maintenance_date, type, cost, note, status |
| `training_programs` | id, title, code, category, description, vendor, cost, status |
| `training_sessions` | id, program_id, instructor, start_date, end_date, time, location, capacity |
| `training_enrollments` | id, session_id, employee_id, status (Nominated/Registered/Confirmed/Completed), completed_at |
| `notification_templates` | id, code, title, body, channel (email/SMS/WA/Push) |
| `notifications` | id, user_id, template_id, title, message, type, is_read, created_at |
| `approval_workflows` | id, entity_type, entity_id, current_step, status |
| `approval_history` | id, workflow_id, action, actor_id, comment, created_at |

---

## 6. Spesifikasi API

### 6.1 Konvensi
- Base: `/api` • Autentikasi: `Authorization: Bearer <token>` • Format respons: `{ success, message?, data? }` • Error: `{ success: false, message }` dengan status HTTP sesuai.

### 6.2 Auth (`/api/auth`)
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | `/login` | Login + token | Public |
| POST | `/refresh-token` | Refresh access token | Public |
| POST | `/logout` | Logout (audit) | Auth |
| POST | `/change-password` | Ganti password | Auth |
| GET | `/profile` | Profil user | Auth |
| POST | `/register` | Buat user baru | Admin |

### 6.3 Master & Core HR
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET/POST | `/api/companies` | List/tambah perusahaan |
| PUT/DELETE | `/api/companies/:id` | Ubah/hapus |
| GET | `/api/employees` | List karyawan (filter dept/status/search) |
| GET | `/api/employees/:id` | Detail karyawan |
| POST | `/api/employees` | Tambah karyawan |
| PUT | `/api/employees/:id` | Ubah karyawan |
| GET/POST | `/api/departments`, `/api/positions`, `/api/organization` | Struktur organisasi |

### 6.4 Attendance (`/api/attendance`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Records (filter) |
| POST | `/check-in` | Check-in (foto+GPS) |
| POST | `/check-out` | Check-out |
| GET | `/summary/daily` | Ringkasan harian |
| GET | `/report/monthly` | Rekap bulanan |
| GET/POST/PUT | `/shift`, `/schedule`, `/holiday`, `/overtime` | CRUD pendukung |

### 6.5 Leave (`/api/leave`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/requests` | List request (scope peran) |
| POST | `/requests` | Buat request |
| PUT | `/requests/:id/approve-manager` | Approve tahap Manager |
| PUT | `/requests/:id/approve-hr` | Approve tahap HR |
| PUT | `/requests/:id/reject` | Reject |
| PUT | `/requests/:id/cancel` | Cancel (pemilik) |
| GET | `/balances` | Saldo cuti |
| GET | `/types` | Jenis cuti aktif |

### 6.6 Payroll (`/api/payroll`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET/POST/PUT/DELETE | `/periods`, `/salary-components`, `/assignments` | CRUD master |
| GET | `/employees` | Data karyawan untuk payroll |
| GET | `/summary` | Ringkasan |
| GET | `/calculation-inputs/:employeeId` | Prefill perhitungan |
| POST | `/calculate` | Hitung payroll + PPh21 |
| GET | `/periods/:id/transactions` | Transaksi per periode |

### 6.7 Compliance (`/api/compliance`)
| Method | Endpoint |
|---|---|
| GET/POST/PUT | `/bpjs-health`, `/bpjs-employment`, `/pension`, `/tax-rates` |

### 6.8 ESS (`/api/ess`)
| Method | Endpoint |
|---|---|
| GET/PUT | `/profile` |
| GET | `/payslips` |
| GET | `/dashboard` |

### 6.9 Lainnya
| Modul | Endpoint |
|---|---|
| Asset | `GET/POST /api/asset`, `PUT /api/asset/:id/assign` |
| Training | `GET/POST/PUT/DELETE /api/training/programs`, `/sessions`, `POST /api/training/enroll`, `GET/PUT /api/training/enrollments` |
| Notification | `GET /api/notification`, `PUT /api/notification/:id/read`, `PUT /api/notification/read-all` |
| Reports | `GET /api/reports/dashboard/*`, `GET /api/reports/generate/*`, `GET/POST/DELETE /api/reports/saved` |
| User | `GET /api/users`, `GET /api/users/:id` |

---

## 7. Aturan Bisnis (Business Rules)

| ID | Aturan |
|---|---|
| BR-1 | Request cuti baru selalu dimulai status `Pending Manager`. |
| BR-2 | Manager hanya dapat approve/reject request timnya sendiri (supervisor langsung). |
| BR-3 | Manager **tidak** dapat approve/reject request miliknya sendiri (menunggu atasan). |
| BR-4 | `Pending HR` bagi Manager bersifat info-only (tanpa aksi). |
| BR-5 | Saldo cuti hanya berkurang saat HR Staff/Admin menyetujui (`Approved`). |
| BR-6 | Cancel hanya oleh pemilik, dan hanya jika status belum final. |
| BR-7 | Tabrakan tanggal cuti (overlap) ditolak dengan 409. |
| BR-8 | Cuti melebihi `max_days_per_request` jenis cuti ditolak 400. |
| BR-9 | Saldo kurang dari durasi cuti ditolak 400. |
| BR-10 | Check-in kedua pada hari yang sama ditolak 409. |
| BR-11 | Check-out tanpa check-in ditolak 400. |
| BR-12 | Keterlambatan > 15 menit → status `Late`. |
| BR-13 | Login gagal 5× → akun terkunci 30 menit. |
| BR-14 | Password baru minimal 8 karakter. |
| BR-15 | PPh21 default metode TER; Pasal 17 sebagai alternatif; tarif DB menimpa tarif bawaan. |
| BR-16 | Employer pension (2%) + BPJS employer masuk `employer_cost`. |
| BR-17 | Akses Core HR dibatasi: Admin, HR Staff, Manager (tim saja). |
| BR-18 | Master Data & System Settings hanya Administrator. |
| BR-19 | CRUD training program/sesi hanya Admin/HR; enroll untuk semua karyawan. |
| BR-20 | RBAC divalidasi dua lapis (frontend route guard + backend middleware). |

---

## 8. Kriteria Pengujian (Test Cases)

### 8.1 Auth
| TC | Skenario | Expected |
|---|---|---|
| TC-01 | Login valid (semua role demo) | 200 + token + user object |
| TC-02 | Login password salah 4× | 401 |
| TC-03 | Login gagal 5× | 403 + lock message |
| TC-04 | Change password < 8 karakter | 400 |
| TC-05 | Akses protected route tanpa token | 401 |
| TC-06 | Employee akses route Admin | 403 |
| TC-07 | Refresh token expired | 401 |

### 8.2 Cuti
| TC | Skenario | Expected |
|---|---|---|
| TC-08 | Create request valid (Employee) | 201, status Pending Manager |
| TC-09 | Create tanpa reason/date | 400 |
| TC-10 | Overlap tanggal | 409 |
| TC-11 | Melebihi max_days jenis cuti | 400 |
| TC-12 | Saldo tidak cukup | 400 |
| TC-13 | Approve manager request luar tim | 403 |
| TC-14 | Approve manager request tim | 200 → Pending HR |
| TC-15 | Approve HR | 200 → Approved + saldo berkurang |
| TC-16 | Manager approve request sendiri | Tombol tidak tampil / backend menolak |
| TC-17 | Reject + alasan | 200 → Rejected |
| TC-18 | Cancel oleh non-pemilik | 404 |
| TC-19 | Employee melihat request orang lain | 403 / tidak muncul |

### 8.3 Absensi
| TC | Skenario | Expected |
|---|---|---|
| TC-20 | Check-in valid (foto+GPS) | 200 + status Present |
| TC-21 | Check-in kedua hari sama | 409 |
| TC-22 | Check-in di atas 15 menit terlambat | status Late |
| TC-23 | Check-out tanpa check-in | 400 |
| TC-24 | Check-out normal | 200 + work_hours |
| TC-25 | Riwayat menampilkan foto + link maps | UI menampilkan bukti |

### 8.4 Payroll
| TC | Skenario | Expected |
|---|---|---|
| TC-26 | Calculate dengan tarif DB kosong | Fallback tarif bawaan |
| TC-27 | PPh21 TER kategori A vs C | Nilai berbeda sesuai tabel |
| TC-28 | PPh21 Pasal 17 progresif | Band 5%→35% benar |
| TC-29 | Employer cost termasuk pensiun employer | Termasuk |
| TC-30 | Mobile payroll | Tanpa scroll kanan; tab scrollable |

### 8.5 Lintas
| TC | Skenario | Expected |
|---|---|---|
| TC-31 | Badge Approvals = jumlah baris list (Manager) | Konsisten |
| TC-32 | Toggle tema/bahasa | Persist & konsisten |
| TC-33 | Search karyawan ⌘K | Navigasi benar |
| TC-34 | Header mobile 3 tombol | Tidak menempel (gap cukup) |

---

## 9. Persyaratan Pelaporan
1. Setiap laporan menyediakan ekspor **PDF** atau **Excel** sesuai jenis.
2. Laporan payroll/absensi/cuti harus dapat difilter periode (date_from/date_to).
3. Laporan menghormati scope peran (Manager hanya data timnya).
4. Laporan tersimpan (`saved reports`) dapat di-list, dibuka, dan dihapus.

---

## 10. Lampiran

### 10.1 Kredensial Demo
| Role | Username | Password |
|---|---|---|
| Administrator | admin | admin123 |
| HR Staff | hrstaff | hr123 |
| Manager | manager | mgr123 |
| Employee | employee | emp123 |
| Finance | finance | fin123 |
| Director | director | dir123 |

### 10.2 Variabel Environment (Backend)
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN` (default 7d), `JWT_REFRESH_EXPIRES_IN` (default 30d), `PORT`.

### 10.3 Status ENUM Master
- **Employee**: Permanent, Contract, Probation, Intern, Resigned, Terminated
- **Attendance**: Present, Absent, Late, Half Day, WFH, On Leave
- **Leave**: Pending Manager, Pending HR, Approved, Rejected, Cancelled
- **Payroll Period**: Draft, Initialized, Processing, Simulated, Approved, Paid, Closed
- **Salary Component Type**: Earning, Deduction, Tax, Benefit
- **Training Program**: Planned, Open, Full, InProgress, Completed, Cancelled
- **Enrollment**: Nominated, Registered, Confirmed, Completed
- **Overtime**: Pending, Approved, Paid, Rejected

### 10.4 PPh21 TER Categories (PMK 168/2023)
| Kategori | PTKP Status |
|---|---|
| A | TK/0 (lajang tanpa tanggungan) |
| B | K/0 (menikah tanpa tanggungan), TK/1, TK/2, TK/3 |
| C | K/1, K/2, K/3 (menikah + tanggungan) |

---

*SRS ini disusun dari implementasi aktual sistem (kode backend `backend/src/**`, skema `backend/prisma/schema.sql`, dan frontend `frontend/src/**`) serta selaras dengan BRD.md.*
