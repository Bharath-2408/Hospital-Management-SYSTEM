from rest_framework import viewsets, permissions, filters
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer
from notifications.models import Notification

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all().select_related('patient', 'doctor', 'appointment', 'patient__user', 'doctor__user')
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['diagnosis', 'symptoms', 'patient__full_name', 'doctor__first_name', 'doctor__last_name']

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
        # Default doctor from user if doctor is logged in
        kwargs = {}
        if self.request.user.role == 'doctor' and hasattr(self.request.user, 'doctor_profile'):
            kwargs['doctor'] = self.request.user.doctor_profile

        record = serializer.save(**kwargs)

        if record.patient.user:
            Notification.objects.create(
                user=record.patient.user,
                title="New Medical Record Added",
                message=f"A medical record for '{record.diagnosis}' was recorded by {record.doctor.full_name if record.doctor else 'the hospital'}.",
                notification_type="Medical"
            )
