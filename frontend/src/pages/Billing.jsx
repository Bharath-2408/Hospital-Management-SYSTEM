import React, { useState, useEffect } from 'react';
import { billingAPI, patientsAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  CreditCard,
  Plus,
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

const Billing = () => {
  const { user, isAdmin, isAccountant } = useAuth();
  const canManageBilling = isAdmin || isAccountant;

  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateBillModalOpen, setIsCreateBillModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Form State - Bill
  const initialBillForm = {
    patient: '',
    total_amount: '',
    discount: '0.00',
    tax: '0.00',
    description: 'Consultation and clinical procedure fee',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
  const [billFormData, setBillFormData] = useState(initialBillForm);

  // Form State - Payment
  const initialPaymentForm = {
    amount: '',
    payment_method: 'Cash',
    transaction_id: '',
  };
  const [paymentFormData, setPaymentFormData] = useState(initialPaymentForm);

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await billingAPI.getBills(params);
      setBills(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  useEffect(() => {
    if (canManageBilling) {
      loadPatients();
    }
  }, [canManageBilling]);

  const handleOpenCreateBill = () => {
    setBillFormData({
      ...initialBillForm,
      patient: patients[0]?.id || '',
    });
    setFormError('');
    setIsCreateBillModalOpen(true);
  };

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentFormData({
      amount: bill.balance_due,
      payment_method: 'UPI',
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setFormError('');
    setIsPaymentModalOpen(true);
  };

  const handleOpenReceipt = (bill) => {
    setSelectedBill(bill);
    setIsReceiptModalOpen(true);
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await billingAPI.createBill(billFormData);
      setIsCreateBillModalOpen(false);
      fetchBills();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to generate invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await billingAPI.createPayment({
        ...paymentFormData,
        bill: selectedBill.id,
      });
      setIsPaymentModalOpen(false);
      fetchBills();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to record payment.');
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
            <CreditCard className="w-6 h-6 text-hospital-600" /> Hospital Invoices & Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Electronic billing ledger, multi-method payment receipting, and outstanding balance tracking
          </p>
        </div>

        {canManageBilling && (
          <button
            onClick={handleOpenCreateBill}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-lg shadow-hospital-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-hospital-500 outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-xs text-rose-600 hover:underline">
            Reset
          </button>
        )}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-600">
                      {bill.bill_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {bill.patient_details?.full_name || 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bill.patient_details?.patient_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {bill.bill_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ${bill.final_amount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      ${bill.total_paid}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      ${bill.balance_due}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={bill.payment_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {canManageBilling && bill.payment_status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenPayment(bill)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition"
                        >
                          + Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenReceipt(bill)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-hospital-600 hover:bg-hospital-50 transition"
                        title="View Receipt"
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

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateBillModalOpen}
        onClose={() => setIsCreateBillModalOpen(false)}
        title="Generate Hospital Invoice"
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
            <select
              required
              value={billFormData.patient}
              onChange={(e) => setBillFormData({ ...billFormData, patient: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            >
              <option value="">Choose Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={billFormData.total_amount}
                onChange={(e) => setBillFormData({ ...billFormData, total_amount: e.target.value })}
                placeholder="200.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={billFormData.discount}
                onChange={(e) => setBillFormData({ ...billFormData, discount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tax ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={billFormData.tax}
                onChange={(e) => setBillFormData({ ...billFormData, tax: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={billFormData.description}
              onChange={(e) => setBillFormData({ ...billFormData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={billFormData.due_date}
              onChange={(e) => setBillFormData({ ...billFormData, due_date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateBillModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for ${selectedBill?.bill_number}`}
        maxWidth="max-w-md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Outstanding Balance:</span>
            <span className="text-base font-extrabold text-rose-600">${selectedBill?.balance_due}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              max={selectedBill?.balance_due}
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
            <select
              required
              value={paymentFormData.payment_method}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Insurance">Insurance Claim</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transaction ID / Ref #</label>
            <input
              type="text"
              value={paymentFormData.transaction_id}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, transaction_id: e.target.value })}
              placeholder="e.g. TXN-998812"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-hospital-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice / Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Hospital Billing Invoice & Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedBill && (
          <div className="p-4 border border-slate-200 rounded-2xl space-y-6 text-xs bg-white print:border-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-hospital-600 text-white flex items-center justify-center font-bold text-lg">
                  H+
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">SMART HOSPITAL BILLING</h3>
                  <p className="text-[10px] text-slate-400">Official Financial Invoice & Payment Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-hospital-600 block">
                  {selectedBill.bill_number}
                </span>
                <span className="text-[11px] text-slate-500">Date: {selectedBill.bill_date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To</span>
                <p className="font-bold text-slate-800 text-sm">{selectedBill.patient_details?.full_name}</p>
                <p className="text-slate-500">Patient ID: {selectedBill.patient_details?.patient_id}</p>
                <p className="text-slate-500">Phone: {selectedBill.patient_details?.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <div className="mt-1"><StatusBadge status={selectedBill.payment_status} /></div>
                {selectedBill.due_date && <p className="text-slate-500 mt-1">Due Date: {selectedBill.due_date}</p>}
              </div>
            </div>

            {/* Charges Breakdown */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Description: {selectedBill.description}</span>
                <span>${selectedBill.total_amount}</span>
              </div>
              {Number(selectedBill.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Concession / Discount:</span>
                  <span>-${selectedBill.discount}</span>
                </div>
              )}
              {Number(selectedBill.tax) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Taxes:</span>
                  <span>+${selectedBill.tax}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-200">
                <span>Final Billed Amount:</span>
                <span>${selectedBill.final_amount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-600">
                <span>Total Amount Paid:</span>
                <span>${selectedBill.total_paid}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-600">
                <span>Outstanding Balance:</span>
                <span>${selectedBill.balance_due}</span>
              </div>
            </div>

            {/* Payment Transactions */}
            {selectedBill.payments && selectedBill.payments.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment History
                </h4>
                <div className="space-y-1">
                  {selectedBill.payments.map((pmt) => (
                    <div key={pmt.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                      <div>
                        <span className="font-mono font-bold text-hospital-600 mr-2">{pmt.payment_id}</span>
                        <span>{pmt.payment_method} {pmt.transaction_id ? `(${pmt.transaction_id})` : ''}</span>
                      </div>
                      <div className="font-bold text-emerald-600">
                        +${pmt.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <div className="text-right">
                <div className="h-8 border-b border-dashed border-slate-300 w-36 ml-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Accounts Authorized Seal</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;
