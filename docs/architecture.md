# System Architecture — Smart Hospital & Patient Management System

## 1. High-Level Architecture Overview

The system is built on a decoupled, client-server layered full-stack architecture:

```
┌─────────────────────────────────────────────────────────────┐
│               Client Tier: React.js (Vite)                  │
│  - Tailwind CSS & Lucide Icons                              │
│  - React Router DOM v6                                      │
│  - Axios HTTP Interceptors (Token Auth)                     │
│  - Role-Based Dashboards & Dynamic Navbars                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON over HTTP REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Application Tier: Django & DRF Backend             │
│  - Token Authentication & Custom User Manager               │
│  - Role-Based Permission Classes & Guard Checks             │
│  - Serializers for Schema Validation & Sanitization         │
│  - REST ViewSets (Patients, Doctors, Appointments, etc.)    │
│  - Aggregate Analytics & CSV File Streaming                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Django ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Database Tier: SQLite Database (db.sqlite3)      │
│  - Normalized relational tables with foreign keys           │
│  - Unique constraint enforcement & automated sequences     │
│  - Atomicity, Consistency, Isolation, Durability (ACID)     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Authentication & Authorization Flow

1. **User Login (`/api/auth/login/`)**:
   - Client sends credentials (`username`, `password`).
   - Django validates password hash using PBKDF2/SHA256.
   - On success, generates or retrieves DRF `Token` and returns user profile with assigned role.
2. **Authenticated Requests**:
   - Axios interceptor attaches header: `Authorization: Token <key>`.
   - Django authenticates user and enforces role-level authorization:
     - `admin`: Unrestricted CRUD across all modules.
     - `doctor`: View/manage assigned appointments, create medical records and prescriptions.
     - `receptionist`: Patient registration, appointment scheduling, doctor rosters.
     - `accountant`: Billing generation, payment ledger, revenue analytics.
     - `patient`: View own profile, appointments, prescriptions, medical records, and invoices.

## 3. End-to-End Data Pipeline Example (Patient Registration)
```
User Enters Form -> Client Validation -> Axios POST /api/patients/
-> DRF Serializer Validation -> Django ORM creates DB record
-> SQLite writes row to 'patients_patient' table
-> Response returns 201 Created with generated Patient ID (PAT-YYYY-XXXX)
-> React Table updates live
```
