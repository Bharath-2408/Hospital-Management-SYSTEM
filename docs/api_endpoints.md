# REST API Reference — Smart Hospital & Patient Management System

Base URL: `http://127.0.0.1:8000/api`

## Authentication Header
Except for `/api/auth/login/` and `/api/auth/register/`, all endpoints require:
```
Authorization: Token <YOUR_AUTH_TOKEN>
```

---

## 1. Authentication Endpoints

| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `POST` | `/auth/login/` | Authenticate user & get token | `{"username": "admin", "password": "..."}` |
| `POST` | `/auth/register/` | Register new patient user | User fields |
| `GET` | `/auth/user/` | Fetch profile of logged-in user | - |

---

## 2. Patients API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/patients/` | List patients (supports `?search=`, `?status=`, `?blood_group=`) |
| `POST` | `/patients/` | Create a new patient record (auto generates `PAT-YYYY-XXXX`) |
| `GET` | `/patients/{id}/` | Retrieve patient record by ID |
| `PUT/PATCH` | `/patients/{id}/` | Update patient record |
| `DELETE` | `/patients/{id}/` | Delete patient record from SQLite |
| `GET` | `/patients/me/` | Retrieve profile of logged in patient user |

---

## 3. Doctors API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/doctors/` | List all doctors (supports `?department=`, `?search=`) |
| `POST` | `/doctors/` | Add a doctor (Admin only) |
| `GET` | `/doctors/{id}/` | Retrieve doctor profile and schedules |
| `PUT/PATCH` | `/doctors/{id}/` | Update doctor info |
| `DELETE` | `/doctors/{id}/` | Delete doctor record |

---

## 4. Departments API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/departments/` | List hospital clinical departments |
| `POST` | `/departments/` | Add department |
| `PUT/PATCH` | `/departments/{id}/` | Update department name/status |
| `DELETE` | `/departments/{id}/` | Delete department |

---

## 5. Appointments API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/appointments/` | List appointments (role scoped) |
| `POST` | `/appointments/` | Book appointment |
| `POST` | `/appointments/{id}/update_status/` | Transition status (`Confirmed`, `Completed`, `Cancelled`) |
| `DELETE` | `/appointments/{id}/` | Delete appointment record |

---

## 6. Medical Records API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/medical-records/` | List clinical records |
| `POST` | `/medical-records/` | Create consultation record |
| `GET` | `/medical-records/{id}/` | View full EHR clinical report |

---

## 7. Prescriptions API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/prescriptions/` | List prescriptions with medicine items |
| `POST` | `/prescriptions/` | Create prescription with nested medicine items list |
| `GET` | `/prescriptions/{id}/` | Get prescription details for printing |

---

## 8. Billing & Payments API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/bills/` | List invoices with paid total and balance due |
| `POST` | `/bills/` | Generate bill for patient/appointment |
| `GET` | `/payments/` | List payment transaction receipts |
| `POST` | `/payments/` | Record payment against an invoice (auto-updates bill status) |

---

## 9. Dashboard & Analytics API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats/` | Dynamic role-specific KPIs and metrics |
| `GET` | `/reports/` | Department, workload, and revenue distributions |
| `GET` | `/reports/export-csv/?type={type}` | Download CSV export (`patients`, `appointments`, `doctors`, `billing`) |
