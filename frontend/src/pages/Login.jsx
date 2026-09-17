import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Stethoscope, Users, Receipt, Calendar, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration fields
  const [regData, setRegData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: 'Male',
    blood_group: 'O+',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...regData, role: 'patient' });
      navigate('/');
    } catch (err) {
      const errDetails = err.response?.data;
      if (errDetails && typeof errDetails === 'object') {
        const firstKey = Object.keys(errDetails)[0];
        setError(`${firstKey}: ${errDetails[firstKey][0]}`);
      } else {
        setError('Registration failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectDemoRole = (demoUser) => {
    setIsRegister(false);
    setUsername(demoUser);
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-hospital-950 to-slate-900 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-hospital-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-hospital-500/30 text-2xl font-black">
            H+
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Smart Hospital & Patient System
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-hospital-300">
          Full-Stack Healthcare Information & Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Quick Demo Switcher */}
        <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-hospital-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 1-Click Demo Accounts (Viva & Evaluation)
            </span>
            <span className="text-[10px] bg-hospital-900/80 text-hospital-300 px-2 py-0.5 rounded-full font-mono">
              pwd: admin123
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <button
              type="button"
              onClick={() => selectDemoRole('admin')}
              className="px-2.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-200 font-semibold flex flex-col items-center gap-1 transition"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('doctor_smith')}
              className="px-2.5 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-200 font-semibold flex flex-col items-center gap-1 transition"
            >
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('receptionist')}
              className="px-2.5 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900 border border-teal-800/60 text-teal-200 font-semibold flex flex-col items-center gap-1 transition"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Reception</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('accountant')}
              className="px-2.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 text-amber-200 font-semibold flex flex-col items-center gap-1 transition"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Accountant</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('patient_john')}
              className="px-2.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 font-semibold flex flex-col items-center gap-1 col-span-2 sm:col-span-1 transition"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Patient</span>
            </button>
          </div>
        </div>

        {/* Login / Register Card */}
        <div className="bg-white text-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-100">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or dr.smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-transparent transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-hospital-600/30 text-sm font-bold text-white bg-hospital-600 hover:bg-hospital-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hospital-500 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={regData.first_name}
                    onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={regData.last_name}
                    onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={regData.blood_group}
                    onChange={(e) => setRegData({ ...regData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-hospital-500 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-hospital-600 hover:bg-hospital-700 transition"
              >
                {loading ? 'Registering...' : 'Register as Patient'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-hospital-600 hover:text-hospital-800 font-semibold"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : 'New patient? Create an account here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
