import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, Printer, Download, ExternalLink, Award, ArrowLeft } from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import ClassicAcademicTemplate from '../../components/certificates/templates/ClassicAcademicTemplate';
import ModernTechTemplate from '../../components/certificates/templates/ModernTechTemplate';
import ExecutiveGoldTemplate from '../../components/certificates/templates/ExecutiveGoldTemplate';

const VerifyCertificate = () => {
  const { certId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certId) {
      verify();
    }
  }, [certId]);

  const verify = async () => {
    setLoading(true);
    const data = await certificateService.verifyCertificate(certId);
    setResult(data);
    setLoading(false);
  };

  const cert = result?.certificate;
  const templateId = cert?.templateId || cert?.template?.id || 'classic';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/srm-seal.svg" alt="SRM Seal" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-extrabold text-slate-900 text-sm">SRM Institute of Science & Technology</p>
              <p className="text-[10px] text-blue-600 font-bold tracking-wider">OFFICIAL CERTIFICATE VERIFICATION PORTAL</p>
            </div>
          </div>

          <Link
            to="/login"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
          </Link>
        </div>

        {/* Verification Status Card */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Cryptographically verifying certificate hash...</p>
          </div>
        ) : result?.verified ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-extrabold text-emerald-950">AUTHENTIC SRM CERTIFICATE</h1>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold rounded-full">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    This certificate is official, authentic, and registered in the SRM Research ERP Ledger.
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

            {/* Certificate Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-emerald-200/80 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] font-semibold">CERTIFICATE RECIPIENT</p>
                <p className="font-bold text-slate-900 text-sm">{cert.intern?.name || cert.internName}</p>
                <p className="text-slate-500">{cert.intern?.department || cert.department}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] font-semibold">PROJECT TITLE</p>
                <p className="font-bold text-slate-900 text-sm">{cert.project?.title || cert.projectTitle}</p>
                <p className="text-slate-500">Mentor: {cert.project?.guideName || cert.guideName}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] font-semibold">ISSUE METRICS</p>
                <p className="font-mono text-slate-800">ID: {cert.id}</p>
                <p className="text-slate-500">Issued: {cert.issueDate}</p>
              </div>
            </div>

            {/* Certificate Visual Rendering */}
            <div className="mt-6 pt-4 border-t border-emerald-200">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Original Certificate Document Preview:
              </h2>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
                {templateId === 'classic' && <ClassicAcademicTemplate cert={cert} />}
                {templateId === 'modern' && <ModernTechTemplate cert={cert} />}
                {templateId === 'executive' && <ExecutiveGoldTemplate cert={cert} />}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-red-950">Invalid or Unverified Certificate</h2>
            <p className="text-xs text-red-700 max-w-md mx-auto">
              {result?.message || 'No valid SRM Research ERP certificate matches this ID or verification hash.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyCertificate;
