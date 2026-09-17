from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bill, Payment
from .serializers import BillSerializer, PaymentSerializer
from notifications.models import Notification

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all().select_related('patient', 'appointment', 'patient__user').prefetch_related('payments').order_by('-bill_date', '-created_at')
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['bill_number', 'patient__full_name', 'patient__patient_id', 'description']

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            qs = qs.filter(patient=user.patient_profile)

        status_param = self.request.query_params.get('status', None)
        patient_param = self.request.query_params.get('patient', None)

        if status_param:
            qs = qs.filter(payment_status=status_param)
        if patient_param:
            qs = qs.filter(patient_id=patient_param)

        return qs

    def perform_create(self, serializer):
        bill = serializer.save()
        if bill.patient.user:
            Notification.objects.create(
                user=bill.patient.user,
                title="Invoice Generated",
                message=f"New invoice {bill.bill_number} generated for amount ${bill.final_amount}.",
                notification_type="Billing"
            )

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('bill', 'received_by', 'bill__patient', 'bill__patient__user').order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            qs = qs.filter(bill__patient=user.patient_profile)

        bill_id = self.request.query_params.get('bill', None)
        if bill_id:
            qs = qs.filter(bill_id=bill_id)

        return qs

    def perform_create(self, serializer):
        payment = serializer.save(received_by=self.request.user)
        if payment.bill.patient.user:
            Notification.objects.create(
                user=payment.bill.patient.user,
                title="Payment Received",
                message=f"Payment {payment.payment_id} of ${payment.amount} received via {payment.payment_method}. Bill status: {payment.bill.payment_status}.",
                notification_type="Billing"
            )
