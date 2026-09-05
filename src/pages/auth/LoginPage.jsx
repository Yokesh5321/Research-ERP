// Login Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginAsAdmin, loginAsWorker, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
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
      const user = await login(form.email, form.password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/worker/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdminDemo = async () => {
    try {
      const user = await loginAsAdmin();
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch { toast.error('Failed to login'); }
  };

  const handleWorkerDemo = async () => {
    try {
      const user = await loginAsWorker();
      toast.success(`Welcome, ${user.name}!`);
      navigate('/worker/dashboard');
    } catch { toast.error('Failed to login'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-700 rounded-xl mb-4">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Research ERP</h1>
          <p className="text-sm text-gray-500 mt-1">Research Organization Management System</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Sign in to your account</h2>

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
                  placeholder="you@researcherp.org"
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
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">Demo Access</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Demo buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAdminDemo}
                disabled={loading}
                className="btn btn-secondary justify-center text-xs disabled:opacity-60"
                id="demo-admin-btn"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Admin Login
              </button>
              <button
                onClick={handleWorkerDemo}
                disabled={loading}
                className="btn btn-secondary justify-center text-xs disabled:opacity-60"
                id="demo-worker-btn"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Worker Login
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Research ERP &copy; 2024 · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
