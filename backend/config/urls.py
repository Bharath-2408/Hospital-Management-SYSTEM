from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.views import LoginView, RegisterView, CurrentUserView, UserViewSet
from departments.views import DepartmentViewSet
from doctors.views import DoctorViewSet
from patients.views import PatientViewSet
from appointments.views import AppointmentViewSet
from medical_records.views import MedicalRecordViewSet
from prescriptions.views import PrescriptionViewSet
from billing.views import BillViewSet, PaymentViewSet
from notifications.views import NotificationViewSet
from core.views import DashboardStatsView, ReportsAnalyticsView, ExportReportCSVView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'bills', BillViewSet, basename='bill')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/auth/register/', RegisterView.as_view(), name='api-register'),
    path('api/auth/user/', CurrentUserView.as_view(), name='api-current-user'),

    # Analytics & Reports Endpoints
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='api-dashboard-stats'),
    path('api/reports/', ReportsAnalyticsView.as_view(), name='api-reports'),
    path('api/reports/export-csv/', ExportReportCSVView.as_view(), name='api-export-csv'),

    # REST Router Endpoints
    path('api/', include(router.urls)),
]
