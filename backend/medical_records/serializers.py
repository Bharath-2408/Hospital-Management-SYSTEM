from rest_framework import serializers
from .models import MedicalRecord
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_details', 'doctor', 'doctor_details',
            'appointment', 'diagnosis', 'symptoms', 'examination_notes',
            'tests_recommended', 'treatment_plan', 'record_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'record_date', 'created_at', 'updated_at']
