# Database Design & Entity Relationship (ER) Schema

## Database Engine
**SQLite 3** (`backend/db.sqlite3`) managed via **Django 5+ ORM**.

---

## Entity Relationship Summary

```
User (1) ───────< (1) Doctor ───────< (N) Appointment
  │                                           │
  │ (1)                                       │ (1)
  ▼                                           ▼
Patient (1) ───────< (N) MedicalRecord ───< (1) Prescription ───< (N) PrescriptionMedicine
  │
  └───────< (N) Bill ───< (N) Payment
```

---

## Tables & Schema Specifications

### 1. `users_user`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | System ID |
| `username` | Varchar(150) | Unique, Not Null | Login identifier |
| `role` | Varchar(20) | Not Null | `admin`, `doctor`, `receptionist`, `patient`, `accountant` |
| `email` | Varchar(254) | Nullable | Email address |
| `phone` | Varchar(20) | Nullable | Phone contact |
| `first_name` | Varchar(150) | Nullable | First name |
| `last_name` | Varchar(150) | Nullable | Last name |
| `blood_group` | Varchar(5) | Nullable | Blood group |

### 2. `departments_department`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | Primary Key |
| `name` | Varchar(100) | Unique | E.g. Cardiology, Neurology |
| `code` | Varchar(10) | Unique | E.g. CARD, NEUR |
| `status` | Varchar(20) | Default 'Active' | Active / Inactive |

### 3. `doctors_doctor`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | Primary Key |
| `user_id` | Integer | FK to `users_user`, Unique, Nullable | Linked auth user |
| `department_id` | Integer | FK to `departments_department` | Assigned department |
| `first_name` | Varchar(50) | Not Null | Doctor first name |
| `last_name` | Varchar(50) | Not Null | Doctor last name |
| `specialization` | Varchar(100) | Not Null | Clinical sub-specialty |
| `qualification` | Varchar(100) | Not Null | Degrees & fellowships |
| `experience_years` | Integer | Positive | Years in practice |
| `consultation_fee` | Decimal(10,2) | Default 500.00 | Standard visit charge |
| `status` | Varchar(20) | Choice | Active, On Leave, Inactive |

### 4. `patients_patient`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | Primary Key |
| `patient_id` | Varchar(20) | Unique, Not Null | Formatted ID: `PAT-YYYY-XXXX` |
| `user_id` | Integer | FK to `users_user`, Nullable | Linked login account |
| `full_name` | Varchar(100) | Not Null | Patient name |
| `age` | Integer | Not Null | Age in years |
| `gender` | Varchar(10) | Choice | Male, Female, Other |
| `blood_group` | Varchar(5) | Choice | A+, B+, O+, AB+, etc. |
| `phone` | Varchar(20) | Not Null | Primary contact |
| `status` | Varchar(20) | Choice | Active, Admitted, Discharged, Inactive |

### 5. `appointments_appointment`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | Primary Key |
| `appointment_number`| Varchar(20) | Unique | Formatted number: `APT-YYYY-XXXX` |
| `patient_id` | Integer | FK to `patients_patient` | Patient |
| `doctor_id` | Integer | FK to `doctors_doctor` | Clinician |
| `appointment_date` | Date | Not Null | Scheduled consultation date |
| `appointment_time` | Time | Not Null | Scheduled time |
| `reason` | Text | Not Null | Chief medical complaint |
| `status` | Varchar(20) | Choice | Pending, Confirmed, Completed, Cancelled |

### 6. `medical_records_medicalrecord`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Auto | Primary Key |
| `patient_id` | Integer | FK to `patients_patient` | Patient |
| `doctor_id` | Integer | FK to `doctors_doctor` | Clinician |
| `diagnosis` | Varchar(255) | Not Null | Primary medical finding |
| `symptoms` | Text | Not Null | Reported symptoms |
| `examination_notes`| Text | Nullable | Physical exam findings |
| `tests_recommended`| Text | Nullable | Laboratory/Imaging orders |
| `treatment_plan` | Text | Nullable | Therapeutic plan |

### 7. `prescriptions_prescription` & `prescriptions_prescriptionmedicine`
- **Prescription**: Contains prescription number (`RX-YYYY-XXXX`), patient FK, doctor FK, diagnosis, notes, and timestamp.
- **PrescriptionMedicine**: Contains prescription FK, medicine name, dosage, frequency, duration, and special instructions.

### 8. `billing_bill` & `billing_payment`
- **Bill**: Contains bill number (`INV-YYYY-XXXX`), patient FK, total amount, discount, tax, final amount, payment status (`Pending`, `Partially Paid`, `Paid`), bill date, due date.
- **Payment**: Contains payment ID (`PAY-YYYY-XXXX`), bill FK, amount, payment method (`Cash`, `Credit Card`, `UPI`, `Net Banking`), status, and received_by FK.
