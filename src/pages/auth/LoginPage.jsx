// Login Page - Dual Portal Architecture (Admin + Candidate / Student Login)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, UserCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [loginType, setLoginType] = useState('admin'); // 'admin' | 'candidate'
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const user = await login(form.email, form.password, loginType);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/worker/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/srm-logo.svg" alt="SRM" className="h-16 object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Research ERP Portal</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">SRM · Directorate of Research</p>
        </div>

        {/* Card */}
        <div className="card shadow-sm">
          <div className="card-body">
            {/* Header / Choose login type */}
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                LOGIN PORTAL
              </span>
              <h2 className="text-base font-semibold text-gray-900">Choose your login type</h2>
              <p className="text-xs text-gray-500 mt-0.5">Select the authorized portal for your role</p>
            </div>

            {/* Dual Login Selector Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* ADMIN LOGIN */}
              <button
                type="button"
                onClick={() => { setLoginType('admin'); setErrors({}); }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                  loginType === 'admin'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${
                    loginType === 'admin' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  {loginType === 'admin' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">ADMIN LOGIN</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Access for Admin only</p>
              </button>

              {/* CANDIDATE LOGIN */}
              <button
                type="button"
                onClick={() => { setLoginType('candidate'); setErrors({}); }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                  loginType === 'candidate'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${
                    loginType === 'candidate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  {loginType === 'candidate' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">CANDIDATE LOGIN</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Worker / Student login</p>
              </button>
            </div>

            {/* Active Portal Banner */}
            <div className="flex items-center justify-between py-2 px-3 mb-5 rounded-md bg-gray-50 border border-gray-200 text-xs">
              <span className="text-gray-600">
                Signing in as: <strong className="text-gray-900">{loginType === 'admin' ? 'System Administrator' : 'Candidate (Worker / Student)'}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                loginType === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {loginType === 'admin' ? 'Admin Portal' : 'Candidate Portal'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-4">
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: '' })); }}
                  className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder={loginType === 'admin' ? 'admin@researcherp.org' : 'priya.sharma@researcherp.org'}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: '' })); }}
                    className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Remember credentials</span>
                </label>
                <span className="text-xs text-gray-400">Authorized only</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`btn w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed ${
                  loginType === 'admin'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                    : 'btn-primary'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Authenticating...' : `Sign in as ${loginType === 'admin' ? 'Administrator' : 'Candidate'}`}
                {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400">
                Access is restricted to authorized scholars and administrators.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SRM &copy; 2024 · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
