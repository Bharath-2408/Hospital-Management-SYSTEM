import React, { useState, useEffect } from 'react';
import { coreAPI } from '../services/api';
import {
  BarChart3,
  Download,
  Building2,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await coreAPI.getReports();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = (type) => {
    const token = localStorage.getItem('token');
    const url = coreAPI.getExportUrl(type);

    fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('Export failed'));
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-hospital-600" /> Hospital Analytics & CSV Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical aggregations, clinical metrics, and raw CSV data downloads
          </p>
        </div>

        {/* CSV Export Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export:
          </span>
          <button
            onClick={() => handleExportCSV('patients')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> Patients CSV
          </button>
          <button
            onClick={() => handleExportCSV('appointments')}
            className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs border border-teal-200 transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Appointments CSV
          </button>
          <button
            onClick={() => handleExportCSV('doctors')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 transition flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" /> Doctors CSV
          </button>
          <button
            onClick={() => handleExportCSV('billing')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs border border-amber-200 transition flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" /> Billing CSV
          </button>
        </div>
      </div>

      {/* Visual Aggregation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-hospital-600" /> Appointments by Clinical Department
          </h3>
          <div className="space-y-3">
            {data?.departments?.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-slate-500">{dept.appointment_count} bookings</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-hospital-600 rounded-full"
                    style={{
                      width: `${Math.min(100, (dept.appointment_count / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-teal-600" /> Doctor Workload & Consultations
          </h3>
          <div className="space-y-3">
            {data?.doctor_workloads?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Dr. {doc.first_name} {doc.last_name}
                  </span>
                  <span className="text-slate-400 text-[10px]">{doc.specialization}</span>
                </div>
                <span className="bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full text-xs">
                  {doc.total_consultations} Consults
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-purple-600" /> Appointment Status Distribution
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data?.appointment_statuses?.map((st, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{st.status}</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{st.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Revenue by Payment Method
          </h3>
          <div className="space-y-2.5">
            {data?.payment_methods?.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{pm.payment_method}</span>
                  <span className="text-slate-500 text-[11px] block">{pm.count} transactions</span>
                </div>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ${Number(pm.total_amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
