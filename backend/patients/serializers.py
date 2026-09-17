from rest_framework import serializers
from .models import Patient
import datetime

class PatientSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(required=False)

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'user', 'full_name', 'age', 'date_of_birth',
            'gender', 'blood_group', 'phone', 'email', 'address',
            'emergency_contact_name', 'emergency_contact_phone',
            'status', 'registration_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'registration_date', 'created_at', 'updated_at']

    def create(self, validated_data):
        if not validated_data.get('patient_id'):
            year = datetime.date.today().year
            count = Patient.objects.count() + 1
            # Ensure unique
            pid = f"PAT-{year}-{count:04d}"
            while Patient.objects.filter(patient_id=pid).exists():
                count += 1
                pid = f"PAT-{year}-{count:04d}"
            validated_data['patient_id'] = pid
        return super().create(validated_data)
