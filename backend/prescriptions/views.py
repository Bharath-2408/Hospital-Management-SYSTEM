from rest_framework import viewsets, permissions, filters
from .models import Prescription
from .serializers import PrescriptionSerializer
from notifications.models import Notification

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().select_related('patient', 'doctor', 'patient__user', 'doctor__user').prefetch_related('medicines').order_by('-prescription_date', '-created_at')
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['prescription_number', 'diagnosis', 'patient__full_name', 'doctor__first_name', 'doctor__last_name']

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            qs = qs.filter(patient=user.patient_profile)
        elif user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            qs = qs.filter(doctor=user.doctor_profile)

        patient_param = self.request.query_params.get('patient', None)
        if patient_param:
            qs = qs.filter(patient_id=patient_param)

        return qs

    def perform_create(self, serializer):
        kwargs = {}
        if self.request.user.role == 'doctor' and hasattr(self.request.user, 'doctor_profile'):
            kwargs['doctor'] = self.request.user.doctor_profile

        prescription = serializer.save(**kwargs)

        if prescription.patient.user:
            Notification.objects.create(
                user=prescription.patient.user,
                title="Prescription Issued",
                message=f"Prescription {prescription.prescription_number} issued by Dr. {prescription.doctor.full_name if prescription.doctor else 'Hospital'}.",
                notification_type="Medical"
            )
