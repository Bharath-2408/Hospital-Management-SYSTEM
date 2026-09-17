# Smart Hospital & Patient Management System

A production-style, fully functional, academic full-stack web application designed for comprehensive hospital workflow automation, patient lifecycle management, clinical documentation, and billing administration.

Built strictly in adherence to the **CRUD Web Application SOP** and academic evaluation guidelines.

---

## 🏥 Key Features

- **Genuine End-to-End CRUD**: Every operation connects from React UI → DRF Serializers → Django ORM → SQLite database.
- **6 User Roles & Permissions**:
  - 👑 **Super Admin / Hospital Administrator**: Full system CRUD, department setup, staff roster, financial analytics.
  - 🩺 **Doctor**: Assigned appointment queue, patient consultation, diagnostic EHR records, multi-drug prescriptions.
  - 📋 **Receptionist**: Patient onboarding, appointment booking desk, clinician availability rosters.
  - 💰 **Accountant**: Invoice generation, multi-method payment receipting, financial audit reports.
  - 🧑‍🦱 **Patient**: Personal health dashboard, appointment booking portal, active prescriptions, billing receipts.
- **Automated Demo Account Switcher**: 1-click credential selector on the login page for rapid viva presentation and examiner walkthroughs.
- **Printable Clinical Slips**:
  - Official Doctor Prescription Slip (Rx) with medicine dosages and instructions.
  - Hospital Invoicing & Payment Receipt with transaction reference IDs.
- **Analytics & CSV Reporting**:
  - Live charts for clinical department workloads and payment breakdown.
  - 1-click **Export to CSV** for Patients, Appointments, Doctors, and Billing.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18+ (Vite), Tailwind CSS, Lucide React, Axios, React Router v6 |
| **Backend** | Python 3, Django 5+, Django REST Framework (DRF), django-cors-headers |
| **Database** | SQLite 3 (`backend/db.sqlite3`), Django ORM with full ACID compliance |
| **Authentication**| DRF Token Authentication + Session Authentication + PBKDF2 Password Hashing |
| **Testing & Tools**| DRF Test Client, Postman Collection v2.1 |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (available via `py` on Windows)
- Node.js 18+ and npm

---

### Step 1: Start the Backend (Django + DRF)

Open a terminal in the project root:

```powershell
cd backend

# 1. Activate the provided virtual environment
.\venv\Scripts\Activate.ps1

# 2. Apply database migrations
python manage.py migrate

# 3. Populate realistic healthcare demo data
python manage.py seed_data

# 4. Start the Django API server
python manage.py runserver 8000
```
Backend will be live at: **`http://127.0.0.1:8000/`**  
API Root: **`http://127.0.0.1:8000/api/`**

---

### Step 2: Start the Frontend (React + Vite)

Open a second terminal in the project root:

```powershell
cd frontend

# 1. Run the development server
npm run dev
```
Frontend will be live at: **`http://localhost:5173/`**

---

## 🔑 Pre-Seeded Demo Accounts (Password: `admin123`)

| Role | Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full access across all clinical and financial modules |
| **Doctor** | `doctor_smith` | `admin123` | Senior Cardiologist portal |
| **Doctor** | `doctor_jane` | `admin123` | Neurologist portal |
| **Receptionist** | `receptionist` | `admin123` | Front desk appointment & registration portal |
| **Accountant** | `accountant` | `admin123` | Financial billing & receipts portal |
| **Patient** | `patient_john` | `admin123` | Patient self-service health portal |

> **Pro Tip**: On the login page, simply click any of the role buttons under **"1-Click Demo Accounts"** to automatically fill in credentials!

---

## 📁 Project Architecture

```
ranjith/
├── backend/
│   ├── config/              # Django settings, root URLs, WSGI
│   ├── users/               # Custom User model & Token Auth endpoints
│   ├── departments/         # Clinical department models & API
│   ├── doctors/             # Doctor profiles, specialties, schedules
│   ├── patients/            # Patient demographics & medical records
│   ├── appointments/        # Scheduling, status workflows (Pending/Confirmed/etc.)
│   ├── medical_records/     # Electronic Health Records (EHR) & diagnosis
│   ├── prescriptions/       # Prescription header & multi-drug items
│   ├── billing/             # Invoices, payments, and balance tracking
│   ├── notifications/       # Real-time user alert drawer
│   ├── core/                # Dashboard KPIs, CSV exporters, seed command
│   ├── test_api.py          # Automated backend verification test suite
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Modals, StatCards, StatusBadges
│   │   ├── context/         # AuthContext (token persistence, role checks)
│   │   ├── pages/           # Role dashboards, CRUD forms for all entities
│   │   ├── services/        # Axios API client & interceptors
│   │   ├── App.jsx          # Route declarations & ProtectedRoute guards
│   │   └── index.css        # Tailwind CSS directives
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── architecture.md      # Tiered system architecture document
│   ├── database_schema.md   # Complete schema dictionary & ER documentation
│   └── api_endpoints.md     # REST API reference guide
├── postman/
│   └── hospital-management.postman_collection.json
└── README.md
```

---

## 🧪 Verification & Automated Testing

A dedicated test suite `backend/test_api.py` verifies all API endpoints and database operations:

```powershell
cd backend
.\venv\Scripts\python.exe test_api.py
```

Output:
```
--- TESTING BACKEND ENDPOINTS ---
[PASS] Login successful! Received token... Role: admin
[PASS] Dashboard stats fetched! Total patients: 5, Total doctors: 4, Revenue: $337.5
[PASS] Patients list fetched! Found 5 patients.
[PASS] Patient CREATE successful! Assigned ID: PAT-2026-0006
[PASS] Patient UPDATE successful! Status changed to: Admitted
[PASS] Patient DELETE successful! Record removed from SQLite.
[PASS] Reports & Analytics endpoint working! Dept count: 8
[PASS] Appointments endpoint working! Found 5 appointments.

ALL BACKEND TESTS PASSED WITH 100% SUCCESS!
```

---

## 📜 Postman Collection

Import the file located at:
`postman/hospital-management.postman_collection.json`  
into Postman to test all CRUD endpoints, authentication tokens, and query parameters.
