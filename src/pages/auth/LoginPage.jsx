// Login Page - Dual Portal Architecture (Admin + Candidate / Student Login) with Quick Certificate Print

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, UserCheck, GraduationCap, ArrowRight, Printer, Award, Search, X, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';
import CertificateGenerator from '../../components/certificates/CertificateGenerator';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [loginType, setLoginType] = useState('admin'); // 'admin' | 'candidate'
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  // Quick Certificate Print Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [searchCertQuery, setSearchCertQuery] = useState('');
  const [recentCerts, setRecentCerts] = useState([]);
  const [activeCertForPrint, setActiveCertForPrint] = useState(null);
  const [searchingCert, setSearchingCert] = useState(false);

  useEffect(() => {
    if (isCertModalOpen) {
      loadCertificatesForPrint();
    }
  }, [isCertModalOpen]);

  const loadCertificatesForPrint = async () => {
    setSearchingCert(true);
    const data = await certificateService.getCertificates();
    setRecentCerts(data);
    if (data.length > 0 && !activeCertForPrint) {
      setActiveCertForPrint(data[0]);
    }
    setSearchingCert(false);
  };

  const handleQuickCertSearch = async (e) => {
    e.preventDefault();
    if (!searchCertQuery.trim()) {
      loadCertificatesForPrint();
      return;
    }
    setSearchingCert(true);
    const found = await certificateService.getCertificateById(searchCertQuery.trim());
    if (found) {
      setActiveCertForPrint(found);
      toast.success(`Found Certificate for ${found.intern?.name || found.internName}`);
    } else {
      toast.error('No certificate found with that ID or Verification Hash.');
    }
    setSearchingCert(false);
  };

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
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

            {/* Quick Certificate Print Feature Banner */}
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" /> Certificate Print Portal
                  </p>
                  <p className="text-[11px] text-gray-500">Quickly print or download verified certificates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow transition flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Now
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

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <p className="text-[11px] text-gray-400">
                Restricted to authorized scholars & admins.
              </p>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> Certificate Print
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SRM &copy; 2024 · All rights reserved
        </p>
      </div>

      {/* QUICK CERTIFICATE PRINT MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-8 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    Certificate API & Quick Print Engine
                  </h3>
                  <p className="text-xs text-gray-400">
                    Search and print authentic SRM Research ERP certificates directly from the portal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCertModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Search Bar & Cert Switcher */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <form onSubmit={handleQuickCertSearch} className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Enter Certificate ID (e.g. CERT-2026-8941) or Hash..."
                    value={searchCertQuery}
                    onChange={(e) => setSearchCertQuery(e.target.value)}
                    className="w-full pl-9 pr-24 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition"
                  >
                    Search
                  </button>
                </form>

                {/* Quick Select Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Select Cert:</span>
                  {recentCerts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCertForPrint(c)}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition flex items-center gap-1 whitespace-nowrap ${
                        activeCertForPrint?.id === c.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {activeCertForPrint?.id === c.id && <CheckCircle2 className="w-3 h-3" />}
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Generator View Component */}
              {searchingCert ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">Fetching certificate details...</p>
                </div>
              ) : activeCertForPrint ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" /> Active Certificate: <span className="font-mono text-blue-600">{activeCertForPrint.id}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Recipient: <strong>{activeCertForPrint.intern?.name || activeCertForPrint.internName}</strong>
                    </span>
                  </div>

                  <CertificateGenerator
                    cert={activeCertForPrint}
                    onUpdateTemplate={(tmplId) => {
                      setActiveCertForPrint((prev) => ({ ...prev, templateId: tmplId }));
                    }}
                  />
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No certificate selected for print output.
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center text-xs">
              <span className="text-gray-500">
                Print Engine: A4 Landscape · Cryptographically Signed
              </span>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Close Portal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

