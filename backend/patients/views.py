from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['patient_id', 'full_name', 'phone', 'email', 'emergency_contact_name']

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        # If user is a patient, only show their patient record
        if user.role == 'patient':
            return qs.filter(user=user)

        status_param = self.request.query_params.get('status', None)
        blood_group = self.request.query_params.get('blood_group', None)
        gender = self.request.query_params.get('gender', None)

        if status_param:
            qs = qs.filter(status=status_param)
        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        if gender:
            qs = qs.filter(gender=gender)

        return qs

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Returns current patient record if logged in user is a patient"""
        try:
            patient = Patient.objects.get(user=request.user)
            return Response(self.get_serializer(patient).data)
        except Patient.DoesNotExist:
            return Response({'detail': 'No patient profile found for current user.'}, status=404)
