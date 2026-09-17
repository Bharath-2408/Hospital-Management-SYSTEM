from rest_framework import serializers
from .models import Bill, Payment
from patients.serializers import PatientSerializer
import datetime

class PaymentSerializer(serializers.ModelSerializer):
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'bill', 'amount', 'payment_method',
            'transaction_id', 'status', 'received_by', 'received_by_name',
            'payment_date'
        ]
        read_only_fields = ['id', 'payment_id', 'payment_date']

    def create(self, validated_data):
        year = datetime.date.today().year
        count = Payment.objects.count() + 1
        validated_data['payment_id'] = f"PAY-{year}-{count:04d}"
        payment = super().create(validated_data)

        # Update bill payment status
        bill = payment.bill
        total_paid = sum(p.amount for p in bill.payments.filter(status='Successful'))
        if total_paid >= bill.final_amount:
            bill.payment_status = 'Paid'
        elif total_paid > 0:
            bill.payment_status = 'Partially Paid'
        else:
            bill.payment_status = 'Pending'
        bill.save()

        return payment

class BillSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id', 'bill_number', 'patient', 'patient_details', 'appointment',
            'total_amount', 'discount', 'tax', 'final_amount',
            'payment_status', 'bill_date', 'due_date', 'description',
            'payments', 'total_paid', 'balance_due', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'bill_number', 'bill_date', 'created_at', 'updated_at']

    def get_total_paid(self, obj):
        return sum(p.amount for p in obj.payments.filter(status='Successful'))

    def get_balance_due(self, obj):
        return max(0, obj.final_amount - self.get_total_paid(obj))

    def create(self, validated_data):
        year = datetime.date.today().year
        count = Bill.objects.count() + 1
        validated_data['bill_number'] = f"INV-{year}-{count:04d}"

        # Calculate final amount if not explicitly passed
        total = validated_data.get('total_amount', 0)
        discount = validated_data.get('discount', 0)
        tax = validated_data.get('tax', 0)
        validated_data['final_amount'] = max(0, total - discount + tax)

        return super().create(validated_data)
