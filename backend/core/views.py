import csv
import datetime
from django.http import HttpResponse
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from patients.models import Patient
from doctors.models import Doctor
from departments.models import Department
from appointments.models import Appointment
from medical_records.models import MedicalRecord
from prescriptions.models import Prescription
from billing.models import Bill, Payment

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        today = datetime.date.today()

        data = {
            'role': role,
            'user': {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'role': user.role,
            }
        }

        if role in ['admin', 'receptionist']:
            data.update({
                'total_patients': Patient.objects.count(),
                'active_patients': Patient.objects.filter(status='Active').count(),
                'admitted_patients': Patient.objects.filter(status='Admitted').count(),
                'total_doctors': Doctor.objects.count(),
                'active_doctors': Doctor.objects.filter(status='Active').count(),
                'total_departments': Department.objects.count(),
                'today_appointments': Appointment.objects.filter(appointment_date=today).count(),
                'pending_appointments': Appointment.objects.filter(status='Pending').count(),
                'completed_appointments': Appointment.objects.filter(status='Completed').count(),
                'total_revenue': float(Payment.objects.filter(status='Successful').aggregate(total=Sum('amount'))['total'] or 0),
                'pending_revenue': float(Bill.objects.filter(payment_status__in=['Pending', 'Partially Paid']).aggregate(total=Sum('final_amount'))['total'] or 0),
            })
        elif role == 'doctor':
            doctor = getattr(user, 'doctor_profile', None)
            if doctor:
                my_appointments = Appointment.objects.filter(doctor=doctor)
                data.update({
                    'doctor_name': doctor.full_name,
                    'specialization': doctor.specialization,
                    'today_appointments': my_appointments.filter(appointment_date=today).count(),
                    'pending_today': my_appointments.filter(appointment_date=today, status__in=['Pending', 'Confirmed']).count(),
                    'completed_consultations': my_appointments.filter(status='Completed').count(),
                    'total_assigned_patients': my_appointments.values('patient').distinct().count(),
                    'total_prescriptions': Prescription.objects.filter(doctor=doctor).count(),
                    'total_records': MedicalRecord.objects.filter(doctor=doctor).count(),
                })
            else:
                data.update({'message': 'No doctor profile linked.'})

        elif role == 'patient':
            patient = getattr(user, 'patient_profile', None)
            if patient:
                my_appointments = Appointment.objects.filter(patient=patient)
                my_bills = Bill.objects.filter(patient=patient)
                data.update({
                    'patient_id': patient.patient_id,
                    'patient_name': patient.full_name,
                    'upcoming_appointments': my_appointments.filter(appointment_date__gte=today, status__in=['Pending', 'Confirmed']).count(),
                    'total_consultations': my_appointments.filter(status='Completed').count(),
                    'active_prescriptions': Prescription.objects.filter(patient=patient).count(),
                    'unpaid_bills': my_bills.filter(payment_status__in=['Pending', 'Partially Paid']).count(),
                    'total_paid': float(Payment.objects.filter(bill__patient=patient, status='Successful').aggregate(total=Sum('amount'))['total'] or 0),
                })
            else:
                data.update({'message': 'No patient profile linked.'})

        elif role == 'accountant':
            data.update({
                'total_billed': float(Bill.objects.aggregate(total=Sum('final_amount'))['total'] or 0),
                'total_collected': float(Payment.objects.filter(status='Successful').aggregate(total=Sum('amount'))['total'] or 0),
                'pending_invoices_count': Bill.objects.filter(payment_status='Pending').count(),
                'paid_invoices_count': Bill.objects.filter(payment_status='Paid').count(),
                'today_collections': float(Payment.objects.filter(payment_date__date=today, status='Successful').aggregate(total=Sum('amount'))['total'] or 0),
            })

        return Response(data)

class ReportsAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = datetime.date.today()

        # Monthly appointments over last 6 months
        dept_breakdown = list(
            Department.objects.annotate(
                appointment_count=Count('appointments')
            ).values('name', 'appointment_count')
        )

        appointment_status_counts = list(
            Appointment.objects.values('status').annotate(count=Count('id'))
        )

        patient_status_counts = list(
            Patient.objects.values('status').annotate(count=Count('id'))
        )

        payment_method_counts = list(
            Payment.objects.filter(status='Successful').values('payment_method').annotate(
                total_amount=Sum('amount'),
                count=Count('id')
            )
        )

        doctor_workloads = list(
            Doctor.objects.annotate(
                total_consultations=Count('appointments')
            ).values('id', 'first_name', 'last_name', 'specialization', 'total_consultations')
        )

        return Response({
            'departments': dept_breakdown,
            'appointment_statuses': appointment_status_counts,
            'patient_statuses': patient_status_counts,
            'payment_methods': payment_method_counts,
            'doctor_workloads': doctor_workloads,
        })

class ExportReportCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'patients')
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{datetime.date.today()}.csv"'

        writer = csv.writer(response)

        if report_type == 'patients':
            writer.writerow(['Patient ID', 'Full Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'Email', 'Status', 'Registration Date'])
            for p in Patient.objects.all():
                writer.writerow([p.patient_id, p.full_name, p.age, p.gender, p.blood_group, p.phone, p.email, p.status, p.registration_date])

        elif report_type == 'appointments':
            writer.writerow(['Appointment No', 'Patient', 'Doctor', 'Department', 'Date', 'Time', 'Reason', 'Status'])
            for a in Appointment.objects.select_related('patient', 'doctor', 'department').all():
                writer.writerow([a.appointment_number, a.patient.full_name, a.doctor.full_name, a.department.name if a.department else '', a.appointment_date, a.appointment_time, a.reason, a.status])

        elif report_type == 'doctors':
            writer.writerow(['Doctor Name', 'Department', 'Specialization', 'Qualification', 'Experience (Yrs)', 'Fee', 'Phone', 'Email', 'Status'])
            for d in Doctor.objects.select_related('department').all():
                writer.writerow([d.full_name, d.department.name if d.department else '', d.specialization, d.qualification, d.experience_years, d.consultation_fee, d.phone, d.email, d.status])

        elif report_type == 'billing':
            writer.writerow(['Bill No', 'Patient', 'Total Amount', 'Discount', 'Tax', 'Final Amount', 'Payment Status', 'Bill Date'])
            for b in Bill.objects.select_related('patient').all():
                writer.writerow([b.bill_number, b.patient.full_name, b.total_amount, b.discount, b.tax, b.final_amount, b.payment_status, b.bill_date])

        else:
            return Response({'detail': 'Invalid report type specified.'}, status=status.HTTP_400_BAD_REQUEST)

        return response
