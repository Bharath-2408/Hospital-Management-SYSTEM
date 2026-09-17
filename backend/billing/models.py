from django.db import models
from django.conf import settings
from patients.models import Patient
from appointments.models import Appointment

class Bill(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
    )

    bill_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    bill_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    description = models.CharField(max_length=255, blank=True, default='Consultation and clinical service charges')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-bill_date', '-created_at']

    def __str__(self):
        return f"{self.bill_number} - {self.patient.full_name} (${self.final_amount}) [{self.payment_status}]"

class Payment(models.Model):
    METHOD_CHOICES = (
        ('Cash', 'Cash'),
        ('Credit Card', 'Credit Card'),
        ('Debit Card', 'Debit Card'),
        ('UPI', 'UPI'),
        ('Net Banking', 'Net Banking'),
        ('Insurance', 'Insurance'),
    )
    STATUS_CHOICES = (
        ('Successful', 'Successful'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    )

    payment_id = models.CharField(max_length=20, unique=True)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Successful')
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_payments')
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.payment_id} - ${self.amount} ({self.payment_method})"
