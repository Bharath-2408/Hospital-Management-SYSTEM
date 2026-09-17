from rest_framework import viewsets, permissions, filters
from .models import Doctor
from .serializers import DoctorSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().select_related('department', 'user').order_by('first_name')
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'specialization', 'qualification', 'phone', 'email', 'department__name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = self.queryset
        dept_id = self.request.query_params.get('department', None)
        status_param = self.request.query_params.get('status', None)
        if dept_id:
            qs = qs.filter(department_id=dept_id)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs
