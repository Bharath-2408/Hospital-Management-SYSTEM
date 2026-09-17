from django.db import models
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='medical_records')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_records')
    diagnosis = models.CharField(max_length=255)
    symptoms = models.TextField()
    examination_notes = models.TextField(blank=True, default='')
    tests_recommended = models.TextField(blank=True, default='')
    treatment_plan = models.TextField(blank=True, default='')
    record_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-record_date', '-created_at']

    def __str__(self):
        return f"Record for {self.patient.full_name} - {self.diagnosis} ({self.record_date})"
