from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from notifications.models import Notification

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('patient', 'doctor', 'department', 'doctor__user', 'patient__user').order_by('-appointment_date', '-appointment_time')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['appointment_number', 'patient__full_name', 'doctor__first_name', 'doctor__last_name', 'reason']

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            qs = qs.filter(doctor=user.doctor_profile)
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            qs = qs.filter(patient=user.patient_profile)

        status_param = self.request.query_params.get('status', None)
        date_param = self.request.query_params.get('date', None)
        doctor_param = self.request.query_params.get('doctor', None)
        patient_param = self.request.query_params.get('patient', None)

        if status_param:
            qs = qs.filter(status=status_param)
        if date_param:
            qs = qs.filter(appointment_date=date_param)
        if doctor_param:
            qs = qs.filter(doctor_id=doctor_param)
        if patient_param:
            qs = qs.filter(patient_id=patient_param)

        return qs

    def perform_create(self, serializer):
        appointment = serializer.save()
        # Create notification for patient user if linked
        if appointment.patient.user:
            Notification.objects.create(
                user=appointment.patient.user,
                title="Appointment Booked",
                message=f"Your appointment {appointment.appointment_number} with Dr. {appointment.doctor.full_name} is scheduled for {appointment.appointment_date} at {appointment.appointment_time}.",
                notification_type="Appointment"
            )
        # Create notification for doctor user if linked
        if appointment.doctor.user:
            Notification.objects.create(
                user=appointment.doctor.user,
                title="New Appointment Scheduled",
                message=f"New appointment {appointment.appointment_number} booked with patient {appointment.patient.full_name} on {appointment.appointment_date}.",
                notification_type="Appointment"
            )

    @action(detail=True, methods=['patch', 'post'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['Pending', 'Confirmed', 'Completed', 'Cancelled']:
            return Response({'detail': 'Invalid appointment status.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = new_status
        if 'notes' in request.data:
            appointment.notes = request.data.get('notes')
        appointment.save()

        # Notify patient
        if appointment.patient.user:
            Notification.objects.create(
                user=appointment.patient.user,
                title=f"Appointment {new_status}",
                message=f"Your appointment {appointment.appointment_number} has been marked as {new_status}.",
                notification_type="Appointment"
            )

        return Response(self.get_serializer(appointment).data)
