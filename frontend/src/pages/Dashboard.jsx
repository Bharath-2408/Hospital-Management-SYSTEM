import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { coreAPI, appointmentsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  CalendarPlus,
  FileText,
  Pill,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, aptsRes] = await Promise.all([
          coreAPI.getStats(),
          appointmentsAPI.getAll({ limit: 5 })
        ]);
        setStats(statsRes.data);
        setAppointments(aptsRes.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role || 'patient';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-hospital-700 via-hospital-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-hospital-900/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-hospital-200 bg-white/10 px-3 py-1 rounded-full">
              Hospital Operations Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Welcome back, {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}!
            </h2>
            <p className="text-hospital-100 text-xs sm:text-sm mt-1">
              Logged in as <span className="font-semibold capitalize">{role}</span>. Real-time healthcare database synced.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'patient' && (
              <Link
                to="/book-appointment"
                className="inline-flex items-center gap-2 bg-white text-hospital-700 hover:bg-hospital-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
              >
                <CalendarPlus className="w-4 h-4" /> Book Appointment
              </Link>
            )}
            {role === 'admin' && (
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
              >
                <FileText className="w-4 h-4" /> View Analytics & CSV
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Role-Tailored Stat Cards */}
      {(role === 'admin' || role === 'receptionist') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Patients"
            value={stats?.total_patients ?? 0}
            icon={Users}
            color="blue"
            subtitle={`${stats?.admitted_patients ?? 0} Currently Admitted`}
          />
          <StatCard
            title="Medical Staff / Doctors"
            value={stats?.total_doctors ?? 0}
            icon={Stethoscope}
            color="purple"
            subtitle={`${stats?.total_departments ?? 0} Clinical Departments`}
          />
          <StatCard
            title="Today's Appointments"
            value={stats?.today_appointments ?? 0}
            icon={Calendar}
            color="teal"
            subtitle={`${stats?.pending_appointments ?? 0} Pending Verification`}
          />
          <StatCard
            title="Total Revenue Collected"
            value={`$${Number(stats?.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle={`$${Number(stats?.pending_revenue || 0).toLocaleString()} Pending`}
          />
        </div>
      )}

      {role === 'doctor' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Appointments"
            value={stats?.today_appointments ?? 0}
            icon={Calendar}
            color="blue"
            subtitle="Scheduled for today"
          />
          <StatCard
            title="Pending Consultations"
            value={stats?.pending_today ?? 0}
            icon={Clock}
            color="amber"
            subtitle="Awaiting consultation"
          />
          <StatCard
            title="Completed Consultations"
            value={stats?.completed_consultations ?? 0}
            icon={CheckCircle2}
            color="green"
            subtitle="Lifetime consultations"
          />
          <StatCard
            title="Prescriptions Issued"
            value={stats?.total_prescriptions ?? 0}
            icon={Pill}
            color="purple"
            subtitle={`${stats?.total_records ?? 0} Medical Records`}
          />
        </div>
      )}

      {role === 'patient' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Upcoming Appointments"
            value={stats?.upcoming_appointments ?? 0}
            icon={Calendar}
            color="blue"
            subtitle="Active bookings"
          />
          <StatCard
            title="Active Prescriptions"
            value={stats?.active_prescriptions ?? 0}
            icon={Pill}
            color="purple"
            subtitle="Medicines prescribed"
          />
          <StatCard
            title="Pending Invoices"
            value={stats?.unpaid_bills ?? 0}
            icon={Receipt}
            color="amber"
            subtitle="Bills awaiting payment"
          />
          <StatCard
            title="Total Paid"
            value={`$${Number(stats?.total_paid || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="Completed hospital payments"
          />
        </div>
      )}

      {role === 'accountant' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Invoiced"
            value={`$${Number(stats?.total_billed || 0).toLocaleString()}`}
            icon={Receipt}
            color="blue"
            subtitle="All generated bills"
          />
          <StatCard
            title="Total Collected"
            value={`$${Number(stats?.total_collected || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="Confirmed payments"
          />
          <StatCard
            title="Today's Receipts"
            value={`$${Number(stats?.today_collections || 0).toLocaleString()}`}
            icon={CheckCircle2}
            color="teal"
            subtitle="Collected today"
          />
          <StatCard
            title="Unpaid Invoices"
            value={stats?.pending_invoices_count ?? 0}
            icon={Clock}
            color="rose"
            subtitle={`${stats?.paid_invoices_count ?? 0} fully settled`}
          />
        </div>
      )}

      {/* Recent Appointments & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Recent Appointments</h3>
              <p className="text-xs text-slate-400">Latest scheduled patient visits</p>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-semibold">Appointment</th>
                  <th className="pb-3 font-semibold">Patient</th>
                  <th className="pb-3 font-semibold">Doctor</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No appointments recorded yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 font-mono font-semibold text-slate-700">
                        {apt.appointment_number}
                      </td>
                      <td className="py-3 font-medium text-slate-800">
                        {apt.patient_details?.full_name || 'Patient'}
                      </td>
                      <td className="py-3 text-slate-600">
                        {apt.doctor_details?.full_name || 'Doctor'}
                      </td>
                      <td className="py-3 text-slate-500">
                        {apt.appointment_date} at {apt.appointment_time?.slice(0, 5)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations / Shortcuts Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-4">Frequently used management tools</p>

            <div className="space-y-2.5">
              {(role === 'admin' || role === 'receptionist') && (
                <Link
                  to="/patients"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-hospital-50 hover:border-hospital-200 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-hospital-700">
                      Register New Patient
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600" />
                </Link>
              )}

              <Link
                to="/appointments"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-hospital-50 hover:border-hospital-200 border border-slate-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-hospital-700">
                    Manage Appointments
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600" />
              </Link>

              {(role === 'admin' || role === 'doctor') && (
                <Link
                  to="/prescriptions"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-hospital-50 hover:border-hospital-200 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-hospital-700">
                      Issue Prescription
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600" />
                </Link>
              )}

              {(role === 'admin' || role === 'accountant') && (
                <Link
                  to="/billing"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-hospital-50 hover:border-hospital-200 border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-hospital-700">
                      Generate Patient Invoice
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600" />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Smart Hospital CRUD application connected directly to SQLite.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
