import React, { useState, useEffect } from 'react';
import { medicalRecordsAPI, patientsAPI, doctorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Calendar,
  User,
  Stethoscope,
  Activity,
  AlertCircle
} from 'lucide-react';

const MedicalRecords = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const canAdd = isDoctor || isAdmin;

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const initialForm = {
    patient: '',
    doctor: '',
    diagnosis: '',
    symptoms: '',
    examination_notes: '',
    tests_recommended: '',
    treatment_plan: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await medicalRecordsAPI.getAll({ search: searchQuery });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [ptsRes, docsRes] = await Promise.all([
        patientsAPI.getAll(),
        doctorsAPI.getAll()
      ]);
      setPatients(ptsRes.data);
      setDoctors(docsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (canAdd) {
      loadDependencies();
    }
  }, [canAdd]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      patient: patients[0]?.id || '',
      doctor: doctors[0]?.id || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await medicalRecordsAPI.create(formData);
      setIsAddModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to save medical record.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-hospital-600" /> Patient Medical Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Electronic Health Records (EHR), clinical findings, and diagnostic notes
          </p>
        </div>

        {canAdd && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-lg shadow-hospital-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Add Medical Record
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Attending Doctor</th>
                <th className="py-3.5 px-4">Diagnosis</th>
                <th className="py-3.5 px-4">Symptoms</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No medical records recorded yet.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {rec.record_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {rec.patient_details?.full_name || 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rec.patient_details?.patient_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {rec.doctor_details?.full_name || 'Dr. Assigned'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-hospital-700 max-w-xs truncate">
                      {rec.diagnosis}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {rec.symptoms}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenView(rec)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-hospital-600 hover:bg-hospital-50 transition"
                        title="View Detailed Clinical Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medical Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Clinical Consultation"
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient *</label>
              <select
                required
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>
                ))}
              </select>
            </div>
            {!isDoctor && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attending Doctor *</label>
                <select
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observed Symptoms *</label>
            <textarea
              required
              rows="2"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Patient reported symptoms and timeline..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Examination Notes</label>
            <textarea
              rows="2"
              value={formData.examination_notes}
              onChange={(e) => setFormData({ ...formData, examination_notes: e.target.value })}
              placeholder="Physical exam, vitals, auscultation..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Tests / Labs</label>
            <input
              type="text"
              value={formData.tests_recommended}
              onChange={(e) => setFormData({ ...formData, tests_recommended: e.target.value })}
              placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan & Follow-up</label>
            <textarea
              rows="2"
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              placeholder="Therapy regimen, lifestyle recommendations..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Clinical Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Record Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Electronic Health Record (EHR)"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-hospital-50/70 rounded-2xl border border-hospital-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-700">Diagnosis</span>
                <h4 className="text-base font-extrabold text-slate-800 mt-0.5">{selectedRecord.diagnosis}</h4>
                <p className="text-slate-500 text-[11px] mt-1">Recorded on: {selectedRecord.record_date}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 block">{selectedRecord.patient_details?.full_name}</span>
                <span className="font-mono text-slate-500 text-[11px]">{selectedRecord.patient_details?.patient_id}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Symptoms Reported</span>
              <p className="text-slate-700 leading-relaxed">{selectedRecord.symptoms}</p>
            </div>

            {selectedRecord.examination_notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Clinical Examination</span>
                <p className="text-slate-700 leading-relaxed">{selectedRecord.examination_notes}</p>
              </div>
            )}

            {selectedRecord.tests_recommended && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Laboratory & Diagnostic Tests Ordered</span>
                <p className="text-slate-700 leading-relaxed font-semibold">{selectedRecord.tests_recommended}</p>
              </div>
            )}

            {selectedRecord.treatment_plan && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="font-bold uppercase text-[10px] text-emerald-800 block mb-1">Treatment Plan & Directives</span>
                <p className="text-emerald-950 leading-relaxed">{selectedRecord.treatment_plan}</p>
              </div>
            )}

            <div className="pt-2 text-right text-[11px] text-slate-400">
              Consulting Clinician: <span className="font-bold text-slate-700">{selectedRecord.doctor_details?.full_name}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
