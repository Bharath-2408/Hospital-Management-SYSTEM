import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI, departmentsAPI, patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarPlus,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successApt, setSuccessApt] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptsRes, docsRes, patientRes] = await Promise.all([
          departmentsAPI.getAll(),
          doctorsAPI.getAll(),
          patientsAPI.getMe()
        ]);
        setDepartments(deptsRes.data);
        setDoctors(docsRes.data);
        setPatientId(patientRes.data.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDoctors = selectedDept
    ? doctors.filter((d) => String(d.department) === String(selectedDept))
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor for your consultation.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await appointmentsAPI.create({
        patient: patientId,
        doctor: selectedDoctor,
        department: selectedDept || doctors.find((d) => String(d.id) === String(selectedDoctor))?.department,
        appointment_date: appointmentDate,
        appointment_time: `${appointmentTime}:00`,
        reason,
      });
      setSuccessApt(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (successApt) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800">Appointment Scheduled!</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your booking reference is{' '}
          <strong className="text-hospital-600 font-mono text-sm">{successApt.appointment_number}</strong>.
          Our medical desk has recorded your consultation with {successApt.doctor_details?.full_name}.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-left space-y-1.5 border border-slate-100">
          <p><strong className="text-slate-700">Date:</strong> {successApt.appointment_date}</p>
          <p><strong className="text-slate-700">Time:</strong> {successApt.appointment_time?.slice(0, 5)}</p>
          <p><strong className="text-slate-700">Doctor:</strong> {successApt.doctor_details?.full_name} ({successApt.doctor_details?.specialization})</p>
          <p><strong className="text-slate-700">Status:</strong> <span className="text-amber-600 font-bold">{successApt.status}</span></p>
        </div>

        <button
          onClick={() => navigate('/appointments')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition"
        >
          View My Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <CalendarPlus className="w-6 h-6 text-hospital-600" /> Book a Consultation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select clinical specialty, preferred doctor, and convenient schedule
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Choose Clinical Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedDoctor('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Select Doctor *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-xl">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                    String(selectedDoctor) === String(doc.id)
                      ? 'border-hospital-500 bg-hospital-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-800">{doc.full_name}</h4>
                    <p className="text-[11px] text-slate-500">{doc.specialization}</p>
                  </div>
                  <div className="mt-2 text-[10px] text-hospital-700 font-semibold flex justify-between items-center">
                    <span>Fee: ${doc.consultation_fee}</span>
                    <span>{doc.available_days}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Time *
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Consultation / Symptoms *
            </label>
            <textarea
              required
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe what symptoms you are experiencing..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs shadow-lg shadow-hospital-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Confirming...' : 'Submit Appointment Request'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
