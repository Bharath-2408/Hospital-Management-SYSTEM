from django.db import models
from django.conf import settings
from departments.models import Department

class Doctor(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('On Leave', 'On Leave'),
        ('Inactive', 'Inactive'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile', null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField(default=1)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    available_days = models.CharField(max_length=100, default='Mon, Tue, Wed, Thu, Fri')
    available_time_start = models.TimeField(default='09:00:00')
    available_time_end = models.TimeField(default='17:00:00')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"Dr. {self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} - {self.specialization}"
