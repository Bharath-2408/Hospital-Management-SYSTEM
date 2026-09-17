import React, { useState, useEffect } from 'react';
import { appointmentsAPI, doctorsAPI, patientsAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Trash2,
  AlertCircle
} from 'lucide-react';

const Appointments = () => {
  const { user, isAdmin, isDoctor, isReceptionist } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  const initialForm = {
    patient: '',
    doctor: '',
    department: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00:00',
    reason: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (doctorFilter) params.doctor = doctorFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await appointmentsAPI.getAll(params);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormDependencies = async () => {
    try {
      const [docsRes, deptsRes] = await Promise.all([
        doctorsAPI.getAll(),
        departmentsAPI.getAll()
      ]);
      setDoctors(docsRes.data);
      setDepartments(deptsRes.data);

      if (isAdmin || isReceptionist) {
        const ptsRes = await patientsAPI.getAll();
        setPatients(ptsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, doctorFilter, dateFilter]);

  useEffect(() => {
    loadFormDependencies();
  }, []);

  const handleOpenBook = async () => {
    let defaultPatient = '';
    if (user?.role === 'patient') {
      try {
        const myPatientRes = await patientsAPI.getMe();
        defaultPatient = myPatientRes.data.id;
      } catch (e) {
        console.error("Patient profile lookup error", e);
      }
    } else if (patients.length > 0) {
      defaultPatient = patients[0].id;
    }

    setFormData({
      ...initialForm,
      patient: defaultPatient,
      doctor: doctors[0]?.id || '',
      department: doctors[0]?.department || '',
    });
    setFormError('');
    setIsBookModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await appointmentsAPI.create(formData);
      setIsBookModalOpen(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to book appointment. Please check inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusTransition = async (aptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(aptId, newStatus);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApt) return;
    setActionLoading(true);
    try {
      await appointmentsAPI.delete(selectedApt.id);
      setIsDeleteModalOpen(false);
      setSelectedApt(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-hospital-600" /> Hospital Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time appointment scheduling, status workflows, and doctor rosters
          </p>
        </div>

        <button
          onClick={handleOpenBook}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-lg shadow-hospital-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-hospital-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {!isDoctor && (
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-hospital-500 outline-none"
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-hospital-500 outline-none"
        />

        {(statusFilter || doctorFilter || dateFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setDoctorFilter('');
              setDateFilter('');
            }}
            className="text-xs text-rose-600 hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Apt Number</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor / Dept</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No appointments recorded.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-600">
                      {apt.appointment_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {apt.patient_details?.full_name || 'Patient'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ID: {apt.patient_details?.patient_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {apt.doctor_details?.full_name || 'Doctor'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {apt.department_details?.name || apt.doctor_details?.specialization}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{apt.appointment_date}</div>
                      <div className="text-[11px] text-slate-500">{apt.appointment_time?.slice(0, 5)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      <p className="truncate font-medium">{apt.reason}</p>
                      {apt.notes && <p className="text-[10px] text-slate-400 italic truncate">{apt.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Status Transition buttons */}
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'Confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition"
                          title="Confirm Appointment"
                        >
                          Confirm
                        </button>
                      )}

                      {(apt.status === 'Confirmed' || (isDoctor && apt.status !== 'Completed')) && apt.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition"
                          title="Mark Consultation Complete"
                        >
                          Complete
                        </button>
                      )}

                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'Cancelled')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] transition"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule New Appointment"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleBookSubmit} className="space-y-4">
          {(isAdmin || isReceptionist) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              >
                <option value="">Choose Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id}) - {p.phone}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
              <select
                required
                value={formData.doctor}
                onChange={(e) => {
                  const docId = e.target.value;
                  const docObj = doctors.find((d) => String(d.id) === String(docId));
                  setFormData({
                    ...formData,
                    doctor: docId,
                    department: docObj?.department || formData.department,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name} - {d.specialization}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              >
                <option value="">Auto-matched to Doctor</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit *</label>
            <textarea
              required
              rows="2"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Describe symptoms or purpose of appointment..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional internal notes..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Appointment Record"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Delete appointment record <strong className="text-slate-800">{selectedApt?.appointment_number}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
