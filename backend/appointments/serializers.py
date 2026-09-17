from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from departments.serializers import DepartmentSerializer
import datetime

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_number', 'patient', 'patient_details',
            'doctor', 'doctor_details', 'department', 'department_details',
            'appointment_date', 'appointment_time', 'reason',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'appointment_number', 'created_at', 'updated_at']

    def create(self, validated_data):
        year = datetime.date.today().year
        count = Appointment.objects.count() + 1
        validated_data['appointment_number'] = f"APT-{year}-{count:04d}"
        
        # Default department from doctor if not explicitly selected
        if not validated_data.get('department') and validated_data.get('doctor'):
            validated_data['department'] = validated_data['doctor'].department

        return super().create(validated_data)
