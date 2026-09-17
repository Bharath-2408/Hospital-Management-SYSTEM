import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  CalendarDays,
  FileText,
  Pill,
  CreditCard,
  BarChart3,
  CalendarPlus,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patients', label: 'Patients', icon: Users },
          { to: '/doctors', label: 'Doctors', icon: Stethoscope },
          { to: '/departments', label: 'Departments', icon: Building2 },
          { to: '/appointments', label: 'Appointments', icon: CalendarDays },
          { to: '/medical-records', label: 'Medical Records', icon: FileText },
          { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
          { to: '/billing', label: 'Billing & Payments', icon: CreditCard },
          { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
        ];
      case 'doctor':
        return [
          { to: '/', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/appointments', label: 'My Appointments', icon: CalendarDays },
          { to: '/patients', label: 'Patients List', icon: Users },
          { to: '/medical-records', label: 'Medical Records', icon: FileText },
          { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
        ];
      case 'receptionist':
        return [
          { to: '/', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patients', label: 'Patient Registration', icon: Users },
          { to: '/appointments', label: 'Appointments Desk', icon: CalendarDays },
          { to: '/doctors', label: 'Doctor Availability', icon: Stethoscope },
        ];
      case 'accountant':
        return [
          { to: '/', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/billing', label: 'Invoices & Payments', icon: CreditCard },
          { to: '/reports', label: 'Financial Reports', icon: BarChart3 },
        ];
      case 'patient':
      default:
        return [
          { to: '/', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
          { to: '/appointments', label: 'My Appointments', icon: CalendarDays },
          { to: '/prescriptions', label: 'My Prescriptions', icon: Pill },
          { to: '/medical-records', label: 'My Medical Records', icon: FileText },
          { to: '/billing', label: 'Bills & Payments', icon: CreditCard },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-hospital-500 flex items-center justify-center text-white font-bold">
              +
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide">CAREPULSE</span>
              <span className="text-[10px] block text-hospital-400 font-semibold tracking-wider uppercase">
                {role} Portal
              </span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-hospital-600 text-white shadow-lg shadow-hospital-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* System footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-medium">
            <span>SQLite Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Smart Hospital v2.0 Academic</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
