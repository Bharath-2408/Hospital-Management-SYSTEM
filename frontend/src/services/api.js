import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  getMe: () => api.get('/auth/user/'),
  updateMe: (data) => api.put('/auth/user/', data),
};

export const departmentsAPI = {
  getAll: (params) => api.get('/departments/', { params }),
  get: (id) => api.get(`/departments/${id}/`),
  create: (data) => api.post('/departments/', data),
  update: (id, data) => api.put(`/departments/${id}/`, data),
  delete: (id) => api.delete(`/departments/${id}/`),
};

export const doctorsAPI = {
  getAll: (params) => api.get('/doctors/', { params }),
  get: (id) => api.get(`/doctors/${id}/`),
  create: (data) => api.post('/doctors/', data),
  update: (id, data) => api.put(`/doctors/${id}/`, data),
  delete: (id) => api.delete(`/doctors/${id}/`),
};

export const patientsAPI = {
  getAll: (params) => api.get('/patients/', { params }),
  get: (id) => api.get(`/patients/${id}/`),
  getMe: () => api.get('/patients/me/'),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}/`, data),
  patch: (id, data) => api.patch(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
};

export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments/', { params }),
  get: (id) => api.get(`/appointments/${id}/`),
  create: (data) => api.post('/appointments/', data),
  update: (id, data) => api.put(`/appointments/${id}/`, data),
  updateStatus: (id, status, notes = '') => api.post(`/appointments/${id}/update_status/`, { status, notes }),
  delete: (id) => api.delete(`/appointments/${id}/`),
};

export const medicalRecordsAPI = {
  getAll: (params) => api.get('/medical-records/', { params }),
  get: (id) => api.get(`/medical-records/${id}/`),
  create: (data) => api.post('/medical-records/', data),
  update: (id, data) => api.put(`/medical-records/${id}/`, data),
  delete: (id) => api.delete(`/medical-records/${id}/`),
};

export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions/', { params }),
  get: (id) => api.get(`/prescriptions/${id}/`),
  create: (data) => api.post('/prescriptions/', data),
  update: (id, data) => api.put(`/prescriptions/${id}/`, data),
  delete: (id) => api.delete(`/prescriptions/${id}/`),
};

export const billingAPI = {
  getBills: (params) => api.get('/bills/', { params }),
  getBill: (id) => api.get(`/bills/${id}/`),
  createBill: (data) => api.post('/bills/', data),
  updateBill: (id, data) => api.put(`/bills/${id}/`, data),
  deleteBill: (id) => api.delete(`/bills/${id}/`),
  getPayments: (params) => api.get('/payments/', { params }),
  createPayment: (data) => api.post('/payments/', data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_as_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export const coreAPI = {
  getStats: () => api.get('/dashboard/stats/'),
  getReports: () => api.get('/reports/'),
  getExportUrl: (type) => `${API_BASE_URL}/reports/export-csv/?type=${type}`,
};

export default api;
