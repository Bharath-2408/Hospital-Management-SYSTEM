import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()
client = APIClient()

print("--- TESTING BACKEND ENDPOINTS ---")

# 1. Login test
login_res = client.post('/api/auth/login/', {'username': 'admin', 'password': 'admin123'}, format='json')
assert login_res.status_code == 200, f"Login failed: {login_res.data}"
token = login_res.data['token']
print(f"[PASS] Login successful! Received token: {token[:10]}... Role: {login_res.data['user']['role']}")

client.credentials(HTTP_AUTHORIZATION='Token ' + token)

# 2. Dashboard stats
stats_res = client.get('/api/dashboard/stats/')
assert stats_res.status_code == 200, f"Stats failed: {stats_res.data}"
print(f"[PASS] Dashboard stats fetched! Total patients: {stats_res.data.get('total_patients')}, Total doctors: {stats_res.data.get('total_doctors')}, Revenue: ${stats_res.data.get('total_revenue')}")

# 3. Patients list
patients_res = client.get('/api/patients/')
assert patients_res.status_code == 200
print(f"[PASS] Patients list fetched! Found {len(patients_res.data)} patients.")

# 4. Create new patient (POST)
new_patient_data = {
    'full_name': 'Automated Test Patient',
    'age': 29,
    'date_of_birth': '1997-03-12',
    'gender': 'Female',
    'blood_group': 'B+',
    'phone': '+1 (555) 998-0011',
    'email': 'autotest@patient.org',
    'address': '101 Quality Assurance Way',
    'emergency_contact_name': 'Test Contact',
    'emergency_contact_phone': '+1 (555) 998-0022',
    'status': 'Active'
}
create_p_res = client.post('/api/patients/', new_patient_data, format='json')
assert create_p_res.status_code == 201, f"Patient create failed: {create_p_res.data}"
created_patient_id = create_p_res.data['id']
assigned_code = create_p_res.data['patient_id']
print(f"[PASS] Patient CREATE successful! Assigned ID: {assigned_code} (PK: {created_patient_id})")

# 5. Update patient (PATCH)
update_res = client.patch(f'/api/patients/{created_patient_id}/', {'status': 'Admitted'}, format='json')
assert update_res.status_code == 200 and update_res.data['status'] == 'Admitted'
print(f"[PASS] Patient UPDATE successful! Status changed to: {update_res.data['status']}")

# 6. Delete patient (DELETE)
del_res = client.delete(f'/api/patients/{created_patient_id}/')
assert del_res.status_code == 204
print(f"[PASS] Patient DELETE successful! Record removed from SQLite.")

# 7. Reports Analytics
reports_res = client.get('/api/reports/')
assert reports_res.status_code == 200
print(f"[PASS] Reports & Analytics endpoint working! Dept count: {len(reports_res.data.get('departments', []))}")

# 8. Appointments
apt_res = client.get('/api/appointments/')
assert apt_res.status_code == 200
print(f"[PASS] Appointments endpoint working! Found {len(apt_res.data)} appointments.")

print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")
