import React, { useState, useEffect } from 'react';
import { Award, Download, Printer, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import CertificateGenerator from '../../components/certificates/CertificateGenerator';
import { useAuth } from '../../context/AuthContext';

const WorkerCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCertificates();
  }, [user]);

  const loadMyCertificates = async () => {
    setLoading(true);
    const certs = await certificateService.getCertificates();
    // Filter by intern name or email or return sample certs
    setCertificates(certs);
    if (certs.length > 0) {
      setSelectedCert(certs[0]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">My SRM Research Certificates</h1>
            <p className="text-xs text-blue-200">
              View, print, and download your officially verified SRM Institute research certificates.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authentic QR Verification Enabled
        </div>
      </div>

      {/* Earned Certificates Picker Tabs */}
      {certificates.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Certificate:</span>
          {certificates.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCert(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCert?.id === c.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {c.project?.title || c.projectTitle || c.id}
            </button>
          ))}
        </div>
      )}

      {/* Active Certificate Generator Canvas */}
      {selectedCert ? (
        <div className="space-y-4">
          <CertificateGenerator cert={selectedCert} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">No Certificates Available Yet</h3>
          <p className="text-xs text-gray-500">
            Complete your assigned research projects to earn verified SRM certificates.
          </p>
        </div>
      )}

    </div>
  );
};

export default WorkerCertificates;
