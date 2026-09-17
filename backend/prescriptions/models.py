from django.db import models
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from medical_records.models import MedicalRecord

class Prescription(models.Model):
    prescription_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='prescriptions')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    diagnosis = models.CharField(max_length=255)
    notes = models.TextField(blank=True, default='')
    prescription_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-prescription_date', '-created_at']

    def __str__(self):
        return f"{self.prescription_number} - {self.patient.full_name}"

class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medicines')
    medicine_name = models.CharField(max_length=150)
    dosage = models.CharField(max_length=100) # e.g. 500mg
    frequency = models.CharField(max_length=100) # e.g. 1-0-1 After Food
    duration = models.CharField(max_length=50) # e.g. 5 Days
    instructions = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"{self.medicine_name} ({self.dosage}) for {self.prescription.prescription_number}"
