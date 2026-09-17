import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from departments.models import Department
from doctors.models import Doctor
from patients.models import Patient
from appointments.models import Appointment
from medical_records.models import MedicalRecord
from prescriptions.models import Prescription, PrescriptionMedicine
from billing.models import Bill, Payment
from notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the SQLite database with rich, realistic hospital demo data'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database with healthcare demo data...")

        # 1. Create Role Users
        users_data = [
            {'username': 'admin', 'email': 'admin@smarthospital.org', 'role': 'admin', 'first_name': 'Eleanor', 'last_name': 'Vance', 'phone': '+1 (555) 019-2831'},
            {'username': 'doctor_smith', 'email': 'dr.smith@smarthospital.org', 'role': 'doctor', 'first_name': 'Alexander', 'last_name': 'Smith', 'phone': '+1 (555) 014-9922'},
            {'username': 'doctor_jane', 'email': 'dr.jane@smarthospital.org', 'role': 'doctor', 'first_name': 'Jane', 'last_name': 'Foster', 'phone': '+1 (555) 018-3847'},
            {'username': 'doctor_raj', 'email': 'dr.raj@smarthospital.org', 'role': 'doctor', 'first_name': 'Rajesh', 'last_name': 'Patel', 'phone': '+1 (555) 012-7711'},
            {'username': 'receptionist', 'email': 'desk@smarthospital.org', 'role': 'receptionist', 'first_name': 'Sarah', 'last_name': 'Jenkins', 'phone': '+1 (555) 017-4839'},
            {'username': 'accountant', 'email': 'billing@smarthospital.org', 'role': 'accountant', 'first_name': 'Marcus', 'last_name': 'Brody', 'phone': '+1 (555) 011-5820'},
            {'username': 'patient_john', 'email': 'john.doe@gmail.com', 'role': 'patient', 'first_name': 'John', 'last_name': 'Doe', 'phone': '+1 (555) 016-1290'},
        ]

        created_users = {}
        for u in users_data:
            user, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'email': u['email'],
                    'role': u['role'],
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'phone': u['phone'],
                    'is_staff': (u['role'] == 'admin'),
                    'is_superuser': (u['role'] == 'admin'),
                }
            )
            user.set_password('admin123')
            user.role = u['role']
            user.first_name = u['first_name']
            user.last_name = u['last_name']
            user.save()
            created_users[u['username']] = user

        self.stdout.write(self.style.SUCCESS("[OK] Role Users created with password 'admin123'."))

        # 2. Departments
        depts_data = [
            {'name': 'General Medicine', 'code': 'GMED', 'description': 'Comprehensive adult healthcare and outpatient treatments'},
            {'name': 'Cardiology', 'code': 'CARD', 'description': 'Specialized heart, vascular, and thoracic care'},
            {'name': 'Neurology', 'code': 'NEUR', 'description': 'Brain, spine, and central nervous system treatments'},
            {'name': 'Orthopedics', 'code': 'ORTH', 'description': 'Bone, joint, trauma, and musculoskeletal disorders'},
            {'name': 'Pediatrics', 'code': 'PEDI', 'description': 'Infant, child, and adolescent specialized medical care'},
            {'name': 'Dermatology', 'code': 'DERM', 'description': 'Skin disorders, allergies, and therapeutic procedures'},
            {'name': 'Emergency', 'code': 'EMER', 'description': '24/7 Level-1 trauma and critical acute interventions'},
            {'name': 'Radiology', 'code': 'RADI', 'description': 'Advanced imaging, MRI, CT scans, and diagnostic ultrasound'},
        ]

        departments = {}
        for d in depts_data:
            dept, _ = Department.objects.get_or_create(
                code=d['code'],
                defaults={'name': d['name'], 'description': d['description'], 'status': 'Active'}
            )
            departments[d['code']] = dept

        self.stdout.write(self.style.SUCCESS("[OK] Hospital Departments created."))

        # 3. Doctors
        doctors_data = [
            {
                'user': created_users['doctor_smith'],
                'first_name': 'Alexander',
                'last_name': 'Smith',
                'department': departments['CARD'],
                'specialization': 'Senior Cardiologist & Interventionalist',
                'qualification': 'MD, FACC, Harvard Medical School',
                'experience_years': 15,
                'consultation_fee': 150.00,
                'phone': '+1 (555) 014-9922',
                'email': 'dr.smith@smarthospital.org',
                'available_days': 'Mon, Wed, Fri',
                'available_time_start': '09:00:00',
                'available_time_end': '16:00:00',
            },
            {
                'user': created_users['doctor_jane'],
                'first_name': 'Jane',
                'last_name': 'Foster',
                'department': departments['NEUR'],
                'specialization': 'Neurologist & Neuro-Rehabilitation',
                'qualification': 'MBBS, MD (Neuro), Johns Hopkins',
                'experience_years': 12,
                'consultation_fee': 180.00,
                'phone': '+1 (555) 018-3847',
                'email': 'dr.jane@smarthospital.org',
                'available_days': 'Tue, Thu, Sat',
                'available_time_start': '10:00:00',
                'available_time_end': '17:00:00',
            },
            {
                'user': created_users['doctor_raj'],
                'first_name': 'Rajesh',
                'last_name': 'Patel',
                'department': departments['ORTH'],
                'specialization': 'Orthopedic Surgeon & Joint Replacement',
                'qualification': 'MS (Ortho), Fellowship in Arthroplasty',
                'experience_years': 14,
                'consultation_fee': 140.00,
                'phone': '+1 (555) 012-7711',
                'email': 'dr.raj@smarthospital.org',
                'available_days': 'Mon, Tue, Thu, Fri',
                'available_time_start': '08:30:00',
                'available_time_end': '15:30:00',
            },
            {
                'user': None,
                'first_name': 'Emily',
                'last_name': 'Chen',
                'department': departments['PEDI'],
                'specialization': 'Consultant Pediatrician',
                'qualification': 'MD (Pediatrics), Stanford University',
                'experience_years': 9,
                'consultation_fee': 120.00,
                'phone': '+1 (555) 019-3321',
                'email': 'dr.chen@smarthospital.org',
                'available_days': 'Mon, Wed, Thu, Sat',
                'available_time_start': '09:00:00',
                'available_time_end': '14:00:00',
            },
        ]

        doctors = []
        for doc_data in doctors_data:
            doc, _ = Doctor.objects.get_or_create(
                first_name=doc_data['first_name'],
                last_name=doc_data['last_name'],
                defaults=doc_data
            )
            doctors.append(doc)

        self.stdout.write(self.style.SUCCESS("[OK] Doctors populated."))

        # 4. Patients
        patients_data = [
            {
                'patient_id': 'PAT-2026-0001',
                'user': created_users['patient_john'],
                'full_name': 'John Doe',
                'age': 42,
                'date_of_birth': '1984-05-14',
                'gender': 'Male',
                'blood_group': 'O+',
                'phone': '+1 (555) 016-1290',
                'email': 'john.doe@gmail.com',
                'address': '742 Evergreen Terrace, Springfield',
                'emergency_contact_name': 'Mary Doe (Wife)',
                'emergency_contact_phone': '+1 (555) 016-9900',
                'status': 'Active',
            },
            {
                'patient_id': 'PAT-2026-0002',
                'user': None,
                'full_name': 'Maria Garcia',
                'age': 35,
                'date_of_birth': '1991-08-22',
                'gender': 'Female',
                'blood_group': 'A+',
                'phone': '+1 (555) 013-8821',
                'email': 'maria.garcia@outlook.com',
                'address': '124 Conch Street, Beverly',
                'emergency_contact_name': 'Carlos Garcia (Brother)',
                'emergency_contact_phone': '+1 (555) 013-4411',
                'status': 'Admitted',
            },
            {
                'patient_id': 'PAT-2026-0003',
                'user': None,
                'full_name': 'Robert Taylor',
                'age': 68,
                'date_of_birth': '1958-02-10',
                'gender': 'Male',
                'blood_group': 'B+',
                'phone': '+1 (555) 015-7744',
                'email': 'robert.t@yahoo.com',
                'address': '89 Bluebell Way, Cambridge',
                'emergency_contact_name': 'Susan Taylor (Daughter)',
                'emergency_contact_phone': '+1 (555) 015-8899',
                'status': 'Active',
            },
            {
                'patient_id': 'PAT-2026-0004',
                'user': None,
                'full_name': 'Ananya Sharma',
                'age': 28,
                'date_of_birth': '1998-11-04',
                'gender': 'Female',
                'blood_group': 'AB+',
                'phone': '+1 (555) 019-6632',
                'email': 'ananya.s@gmail.com',
                'address': '45 Lakeview Meadows, Metro City',
                'emergency_contact_name': 'Karan Sharma (Spouse)',
                'emergency_contact_phone': '+1 (555) 019-9944',
                'status': 'Discharged',
            },
            {
                'patient_id': 'PAT-2026-0005',
                'user': None,
                'full_name': 'Michael Zhang',
                'age': 53,
                'date_of_birth': '1973-04-19',
                'gender': 'Male',
                'blood_group': 'A-',
                'phone': '+1 (555) 018-2255',
                'email': 'mzhang@techcorp.com',
                'address': '550 Bay Street, Suite 402',
                'emergency_contact_name': 'Linda Zhang',
                'emergency_contact_phone': '+1 (555) 018-3366',
                'status': 'Active',
            }
        ]

        patients = []
        for p_data in patients_data:
            p, _ = Patient.objects.get_or_create(
                patient_id=p_data['patient_id'],
                defaults=p_data
            )
            patients.append(p)

        self.stdout.write(self.style.SUCCESS("[OK] Patients seeded."))

        # 5. Appointments
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        tomorrow = today + datetime.timedelta(days=1)

        appointments_data = [
            {
                'appointment_number': 'APT-2026-0001',
                'patient': patients[0],
                'doctor': doctors[0],
                'department': departments['CARD'],
                'appointment_date': yesterday,
                'appointment_time': '10:00:00',
                'reason': 'Recurring chest tightness and mild shortness of breath during exertion.',
                'status': 'Completed',
                'notes': 'ECG done. Medication prescribed.',
            },
            {
                'appointment_number': 'APT-2026-0002',
                'patient': patients[0],
                'doctor': doctors[0],
                'department': departments['CARD'],
                'appointment_date': tomorrow,
                'appointment_time': '11:00:00',
                'reason': 'Post-medication follow-up and blood pressure check.',
                'status': 'Confirmed',
                'notes': 'Patient to bring fasting blood glucose report.',
            },
            {
                'appointment_number': 'APT-2026-0003',
                'patient': patients[1],
                'doctor': doctors[1],
                'department': departments['NEUR'],
                'appointment_date': today,
                'appointment_time': '14:30:00',
                'reason': 'Severe chronic migraines with visual aura.',
                'status': 'Confirmed',
                'notes': 'MRI brain scan requested.',
            },
            {
                'appointment_number': 'APT-2026-0004',
                'patient': patients[2],
                'doctor': doctors[2],
                'department': departments['ORTH'],
                'appointment_date': today,
                'appointment_time': '11:30:00',
                'reason': 'Knee joint pain and stiffness when walking upstairs.',
                'status': 'Pending',
                'notes': 'X-ray bilateral knees ordered.',
            },
            {
                'appointment_number': 'APT-2026-0005',
                'patient': patients[3],
                'doctor': doctors[3],
                'department': departments['PEDI'],
                'appointment_date': yesterday,
                'appointment_time': '09:30:00',
                'reason': 'Routine pediatric vaccination and developmental check.',
                'status': 'Completed',
                'notes': 'Vaccines administered satisfactorily.',
            },
        ]

        appointments = []
        for apt_data in appointments_data:
            apt, _ = Appointment.objects.get_or_create(
                appointment_number=apt_data['appointment_number'],
                defaults=apt_data
            )
            appointments.append(apt)

        self.stdout.write(self.style.SUCCESS("[OK] Appointments seeded."))

        # 6. Medical Records
        med_rec, _ = MedicalRecord.objects.get_or_create(
            patient=patients[0],
            doctor=doctors[0],
            appointment=appointments[0],
            diagnosis='Stage 1 Essential Hypertension & Mild Dyslipidemia',
            defaults={
                'symptoms': 'BP measured 148/92 mmHg. Mild dizziness, occipital headache.',
                'examination_notes': 'S1/S2 heard normally, no heart murmur. Peripheral pulses intact.',
                'tests_recommended': 'Lipid Profile, Serum Creatinine, 12-Lead Electrocardiogram.',
                'treatment_plan': 'Lifestyle modifications, low sodium diet, 30 min daily walking, antihypertensive pharmacotherapy.'
            }
        )

        med_rec2, _ = MedicalRecord.objects.get_or_create(
            patient=patients[1],
            doctor=doctors[1],
            appointment=appointments[2],
            diagnosis='Migraine with Typical Aura',
            defaults={
                'symptoms': 'Unilateral throbbing headache lasting 6 hours, photophobia and nausea.',
                'examination_notes': 'Cranial nerves 2-12 intact. Deep tendon reflexes symmetrical.',
                'tests_recommended': 'Brain MRI without contrast to rule out vascular lesions.',
                'treatment_plan': 'Abortive triptan therapy + prophylactic Magnesium and lifestyle trigger avoidance.'
            }
        )

        self.stdout.write(self.style.SUCCESS("[OK] Medical Records created."))

        # 7. Prescriptions
        rx, rx_created = Prescription.objects.get_or_create(
            prescription_number='RX-2026-0001',
            defaults={
                'patient': patients[0],
                'doctor': doctors[0],
                'appointment': appointments[0],
                'medical_record': med_rec,
                'diagnosis': 'Stage 1 Hypertension & Dyslipidemia',
                'notes': 'Take medications promptly with breakfast. Recheck blood pressure in 2 weeks.'
            }
        )
        if rx_created:
            PrescriptionMedicine.objects.create(
                prescription=rx,
                medicine_name='Telmisartan',
                dosage='40 mg',
                frequency='1-0-0 (Once daily Morning)',
                duration='30 Days',
                instructions='Take after breakfast with water'
            )
            PrescriptionMedicine.objects.create(
                prescription=rx,
                medicine_name='Atorvastatin',
                dosage='10 mg',
                frequency='0-0-1 (Once daily Bedtime)',
                duration='30 Days',
                instructions='Take at night before sleep'
            )

        self.stdout.write(self.style.SUCCESS("[OK] Prescriptions and medicines seeded."))

        # 8. Bills & Payments
        bill1, bill1_created = Bill.objects.get_or_create(
            bill_number='INV-2026-0001',
            defaults={
                'patient': patients[0],
                'appointment': appointments[0],
                'total_amount': 250.00,
                'discount': 25.00,
                'tax': 12.50,
                'final_amount': 237.50,
                'payment_status': 'Paid',
                'description': 'Cardiology Consultation & Diagnostic ECG',
                'due_date': today + datetime.timedelta(days=14)
            }
        )
        if bill1_created:
            Payment.objects.create(
                payment_id='PAY-2026-0001',
                bill=bill1,
                amount=237.50,
                payment_method='Credit Card',
                transaction_id='TXN-CARD-992810',
                status='Successful',
                received_by=created_users['accountant']
            )

        bill2, _ = Bill.objects.get_or_create(
            bill_number='INV-2026-0002',
            defaults={
                'patient': patients[1],
                'appointment': appointments[2],
                'total_amount': 380.00,
                'discount': 0.00,
                'tax': 19.00,
                'final_amount': 399.00,
                'payment_status': 'Pending',
                'description': 'Neurology Consultation & Emergency Admission Initial Fee',
                'due_date': today + datetime.timedelta(days=7)
            }
        )

        bill3, bill3_created = Bill.objects.get_or_create(
            bill_number='INV-2026-0003',
            defaults={
                'patient': patients[2],
                'appointment': appointments[3],
                'total_amount': 180.00,
                'discount': 10.00,
                'tax': 0.00,
                'final_amount': 170.00,
                'payment_status': 'Partially Paid',
                'description': 'Orthopedic Consultation & Knee X-Rays',
                'due_date': today + datetime.timedelta(days=10)
            }
        )
        if bill3_created:
            Payment.objects.create(
                payment_id='PAY-2026-0002',
                bill=bill3,
                amount=100.00,
                payment_method='UPI',
                transaction_id='UPI-HOSP-771829',
                status='Successful',
                received_by=created_users['accountant']
            )

        self.stdout.write(self.style.SUCCESS("[OK] Invoices and Payments seeded."))

        # 9. Notifications
        Notification.objects.get_or_create(
            user=created_users['patient_john'],
            title='Upcoming Appointment Reminder',
            defaults={
                'message': 'You have an appointment tomorrow with Dr. Alexander Smith at 11:00 AM.',
                'notification_type': 'Appointment',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            user=created_users['doctor_smith'],
            title='Patient Follow-up Booked',
            defaults={
                'message': 'John Doe is scheduled for follow-up tomorrow at 11:00 AM.',
                'notification_type': 'Appointment',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            user=created_users['admin'],
            title='System Operational',
            defaults={
                'message': 'All hospital department schedules and automated audit logging are active.',
                'notification_type': 'System',
                'is_read': True
            }
        )

        self.stdout.write(self.style.SUCCESS("[OK] System Notifications created."))
        self.stdout.write(self.style.SUCCESS("\n==> DATABASE SEEDING COMPLETED SUCCESSFULLY!"))
