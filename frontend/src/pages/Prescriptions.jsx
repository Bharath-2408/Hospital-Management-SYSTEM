import React, { useState, useEffect } from 'react';
import { prescriptionsAPI, patientsAPI, doctorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Pill,
  Plus,
  Trash2,
  Printer,
  Eye,
  Calendar,
  User,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

const Prescriptions = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const canPrescribe = isDoctor || isAdmin;

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);

  // Form State with nested medicines list
  const initialMedicine = {
    medicine_name: '',
    dosage: '',
    frequency: '1-0-1 (Twice Daily)',
    duration: '5 Days',
    instructions: 'Take after meals with water',
  };

  const initialForm = {
    patient: '',
    doctor: '',
    diagnosis: '',
    notes: '',
    medicines: [initialMedicine],
  };

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await prescriptionsAPI.getAll();
      setPrescriptions(res.data);
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
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (canPrescribe) {
      loadDependencies();
    }
  }, [canPrescribe]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      patient: patients[0]?.id || '',
      doctor: doctors[0]?.id || '',
      medicines: [{ ...initialMedicine }],
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddMedicineRow = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { ...initialMedicine }],
    });
  };

  const handleRemoveMedicineRow = (index) => {
    if (formData.medicines.length === 1) return;
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((_, idx) => idx !== index),
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData({ ...formData, medicines: updated });
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await prescriptionsAPI.create(formData);
      setIsAddModalOpen(false);
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to issue prescription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Pill className="w-6 h-6 text-hospital-600" /> Prescriptions & Medications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Digital prescription records, pharmacotherapy schedules, and dosage directions
          </p>
        </div>

        {canPrescribe && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-lg shadow-hospital-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Issue New Prescription
          </button>
        )}
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Rx Number</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Prescribing Doctor</th>
                <th className="py-3.5 px-4">Diagnosis</th>
                <th className="py-3.5 px-4">Medicines Count</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No prescriptions on record.
                  </td>
                </tr>
              ) : (
                prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-600">
                      {rx.prescription_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {rx.patient_details?.full_name || 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rx.patient_details?.patient_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {rx.doctor_details?.full_name || 'Dr. Consultant'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {rx.diagnosis}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-purple-100">
                        {rx.medicines?.length || 0} drugs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {rx.prescription_date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRx(rx);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-hospital-600 hover:bg-hospital-50 transition"
                        title="Print / View Prescription"
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

      {/* Add Prescription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Issue Medical Prescription (Rx)"
        maxWidth="max-w-3xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSavePrescription} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>
                ))}
              </select>
            </div>

            {!isDoctor && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
                <select
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                >
                  <option value="">Select Prescribing Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Type II Diabetes / Upper Respiratory Infection"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          {/* Dynamic Medicines Rows */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Prescribed Medications
              </h4>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="inline-flex items-center gap-1 text-xs text-hospital-600 hover:text-hospital-800 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Drug
              </button>
            </div>

            {formData.medicines.map((med, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Drug Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amoxicillin"
                      value={med.medicine_name}
                      onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-hospital-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Dosage *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-hospital-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Frequency *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1-0-1 (Twice Daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-hospital-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7 Days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-hospital-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Take after meal"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-hospital-500"
                      />
                    </div>
                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Doctor's Advice & Diet Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Advice on hydration, rest, or dietary restrictions..."
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
              {actionLoading ? 'Issuing...' : 'Issue Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Prescription Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Hospital Medical Prescription Slip"
        maxWidth="max-w-2xl"
      >
        {selectedRx && (
          <div className="p-4 border border-slate-200 rounded-2xl space-y-6 text-xs bg-white print:border-none">
            {/* Hospital Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-hospital-600 text-white flex items-center justify-center font-bold text-lg">
                  H+
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">SMART HOSPITAL HEALTHCARE</h3>
                  <p className="text-[10px] text-slate-400">Department of Clinical Medicine & Pharmacy</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-hospital-600 block">
                  {selectedRx.prescription_number}
                </span>
                <span className="text-[11px] text-slate-500">Date: {selectedRx.prescription_date}</span>
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Details</span>
                <p className="font-bold text-slate-800 text-sm">{selectedRx.patient_details?.full_name}</p>
                <p className="text-slate-500">ID: {selectedRx.patient_details?.patient_id} • Age: {selectedRx.patient_details?.age} yrs • {selectedRx.patient_details?.gender}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescribing Clinician</span>
                <p className="font-bold text-slate-800 text-sm">{selectedRx.doctor_details?.full_name}</p>
                <p className="text-slate-500">{selectedRx.doctor_details?.specialization}</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Diagnosis</span>
              <p className="font-semibold text-slate-800 text-sm">{selectedRx.diagnosis}</p>
            </div>

            {/* Rx Medicine Table */}
            <div>
              <div className="text-sm font-serif italic text-hospital-800 font-bold mb-2">Rx Medications:</div>
              <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Medicine</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRx.medicines?.map((m, idx) => (
                    <tr key={m.id || idx}>
                      <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800">{m.medicine_name}</td>
                      <td className="p-2.5 font-medium text-slate-700">{m.dosage}</td>
                      <td className="p-2.5 text-slate-700">{m.frequency}</td>
                      <td className="p-2.5 text-slate-700">{m.duration}</td>
                      <td className="p-2.5 text-slate-500 italic">{m.instructions || 'As advised'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedRx.notes && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">Doctor's Advice</span>
                <p className="text-slate-700">{selectedRx.notes}</p>
              </div>
            )}

            {/* Signature & Print */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition"
              >
                <Printer className="w-4 h-4" /> Print Prescription
              </button>

              <div className="text-right">
                <div className="h-10 border-b border-dashed border-slate-300 w-40 ml-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Doctor Signature & Stamp</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
