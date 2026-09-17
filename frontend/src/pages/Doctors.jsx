import React, { useState, useEffect } from 'react';
import { doctorsAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  Stethoscope,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

const Doctors = () => {
  const { isAdmin } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form State
  const initialForm = {
    first_name: '',
    last_name: '',
    department: '',
    specialization: '',
    qualification: '',
    experience_years: 5,
    consultation_fee: 100.00,
    phone: '',
    email: '',
    status: 'Active',
    available_days: 'Mon, Tue, Wed, Thu, Fri',
    available_time_start: '09:00:00',
    available_time_end: '17:00:00',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDept) params.department = selectedDept;
      const res = await doctorsAPI.getAll(params);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      department: departments[0]?.id || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setSelectedDoctor(doc);
    setFormData({
      first_name: doc.first_name,
      last_name: doc.last_name,
      department: doc.department || '',
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience_years: doc.experience_years,
      consultation_fee: doc.consultation_fee,
      phone: doc.phone,
      email: doc.email,
      status: doc.status,
      available_days: doc.available_days,
      available_time_start: doc.available_time_start,
      available_time_end: doc.available_time_end,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (doc) => {
    setSelectedDoctor(doc);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      if (isEditModalOpen && selectedDoctor) {
        await doctorsAPI.update(selectedDoctor.id, formData);
        setIsEditModalOpen(false);
      } else {
        await doctorsAPI.create(formData);
        setIsAddModalOpen(false);
      }
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to save doctor details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    setActionLoading(true);
    try {
      await doctorsAPI.delete(selectedDoctor.id);
      setIsDeleteModalOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to delete doctor. Ensure no active appointments exist.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-hospital-600" /> Doctors & Medical Specialists
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital clinicians, availability schedules, and fees
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-lg shadow-hospital-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchDoctors(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
          />
        </form>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-hospital-500 outline-none w-full md:w-auto"
        >
          <option value="">All Clinical Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
          No doctors found for this query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider bg-hospital-50 px-2.5 py-0.5 rounded-full border border-hospital-100">
                      {doc.department_details?.name || 'Department'}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-base mt-1.5">{doc.full_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{doc.specialization}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Qualification:</span>
                    <span>{doc.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Experience:</span>
                    <span>{doc.experience_years} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-hospital-700 font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Fee: ${doc.consultation_fee} / consultation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.available_days}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.available_time_start?.slice(0, 5)} - {doc.available_time_end?.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(doc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(doc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Doctor: ${selectedDoctor?.full_name}` : 'Add New Doctor'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualification *</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Days</label>
              <input
                type="text"
                value={formData.available_days}
                onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
                placeholder="e.g. Mon, Wed, Fri"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Start</label>
              <input
                type="time"
                value={formData.available_time_start}
                onChange={(e) => setFormData({ ...formData, available_time_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time End</label>
              <input
                type="time"
                value={formData.available_time_end}
                onChange={(e) => setFormData({ ...formData, available_time_end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Update Doctor' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Doctor Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Doctor Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to remove <strong className="text-slate-800">{selectedDoctor?.full_name}</strong> from the clinical directory?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDoctor}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Delete Doctor'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
