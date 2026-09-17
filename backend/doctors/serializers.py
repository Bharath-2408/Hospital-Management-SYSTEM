from rest_framework import serializers
from .models import Doctor
from departments.models import Department
from departments.serializers import DepartmentSerializer

class DoctorSerializer(serializers.ModelSerializer):
    department_details = DepartmentSerializer(source='department', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name',
            'department', 'department_details', 'specialization',
            'qualification', 'experience_years', 'consultation_fee',
            'phone', 'email', 'status', 'available_days',
            'available_time_start', 'available_time_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
