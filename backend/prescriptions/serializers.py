from rest_framework import serializers
from .models import Prescription, PrescriptionMedicine
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
import datetime

class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionMedicine
        fields = ['id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions']
        read_only_fields = ['id']

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    medicines = PrescriptionMedicineSerializer(many=True, required=False)

    class Meta:
        model = Prescription
        fields = [
            'id', 'prescription_number', 'patient', 'patient_details',
            'doctor', 'doctor_details', 'appointment', 'medical_record',
            'diagnosis', 'notes', 'prescription_date', 'medicines', 'created_at'
        ]
        read_only_fields = ['id', 'prescription_number', 'prescription_date', 'created_at']

    def create(self, validated_data):
        medicines_data = validated_data.pop('medicines', [])
        year = datetime.date.today().year
        count = Prescription.objects.count() + 1
        validated_data['prescription_number'] = f"RX-{year}-{count:04d}"

        prescription = Prescription.objects.create(**validated_data)
        for med_data in medicines_data:
            PrescriptionMedicine.objects.create(prescription=prescription, **med_data)
        return prescription

    def update(self, instance, validated_data):
        medicines_data = validated_data.pop('medicines', None)
        instance.diagnosis = validated_data.get('diagnosis', instance.diagnosis)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        if medicines_data is not None:
            instance.medicines.all().delete()
            for med_data in medicines_data:
                PrescriptionMedicine.objects.create(prescription=instance, **med_data)
        return instance
