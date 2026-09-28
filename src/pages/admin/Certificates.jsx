import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Printer,
  Download,
  ShieldCheck,
  Trash2,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import CertificateGenerator from '../../components/certificates/CertificateGenerator';
import IssueCertificateModal from '../../components/certificates/IssueCertificateModal';
import toast from 'react-hot-toast';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    const data = await certificateService.getCertificates();
    setCertificates(data);
    if (data.length > 0 && !selectedCert) {
      setSelectedCert(data[0]);
    }
    setLoading(false);
  };

  const handleCertificateIssued = async (payload) => {
    const newCert = await certificateService.generateCertificate(payload);
    await loadCertificates();
    setSelectedCert(newCert);
  };

  const handleDeleteCert = async (id) => {
    if (window.confirm('Are you sure you want to revoke this certificate?')) {
      await certificateService.deleteCertificate(id);
      toast.success('Certificate revoked');
      await loadCertificates();
      if (selectedCert?.id === id) {
        setSelectedCert(null);
      }
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch =
      c.intern?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.project?.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase());
    const matchesTemplate = !selectedTemplate || c.templateId === selectedTemplate || c.template?.id === selectedTemplate;
    return matchesSearch && matchesTemplate;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Certificate API & Generator</h1>
            <p className="text-xs text-gray-500">
              Architecture Pipeline: Intern Data + Project Data + Templates → Formatter → PDF / Print View
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Issue New Certificate
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Issued</p>
            <p className="text-lg font-bold text-gray-900">{certificates.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Authentic & Verified</p>
            <p className="text-lg font-bold text-emerald-600">{certificates.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Design Templates</p>
            <p className="text-lg font-bold text-amber-600">3 Active</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Print Engine</p>
            <p className="text-lg font-bold text-indigo-600">A4 Landscape</p>
          </div>
        </div>
      </div>

      {/* Main Content Split View: Generator Preview & Certificates Table */}
      {selectedCert && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Active Certificate Generator View: <span className="text-blue-600">{selectedCert.id}</span>
            </h2>
            <span className="text-xs text-gray-500 font-mono">Issued to {selectedCert.intern?.name || selectedCert.internName}</span>
          </div>

          <CertificateGenerator
            cert={selectedCert}
            onUpdateTemplate={(tmplId) => {
              setSelectedCert((prev) => ({ ...prev, templateId: tmplId }));
            }}
          />
        </div>
      )}

      {/* Issued Certificates Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Table Header & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h2 className="text-sm font-bold text-gray-900">Issued Certificates Directory</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student, project, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
            >
              <option value="">All Templates</option>
              <option value="classic">Classic Academic</option>
              <option value="modern">Modern Tech</option>
              <option value="executive">Executive Gold</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Intern / Student</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      selectedCert?.id === c.id ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {c.id}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {c.intern?.name || c.internName}
                      <p className="text-[10px] text-gray-500 font-normal">{c.intern?.role || c.internRole}</p>
                    </td>

                    <td className="py-3 px-4 text-gray-800">
                      {c.project?.title || c.projectTitle}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] uppercase font-bold">
                        {c.templateId || c.template?.id || 'classic'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-500">{c.issueDate}</td>

                    <td className="py-3 px-4 font-bold text-emerald-700">{c.grade}</td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedCert(c)}
                        title="View & Generate Certificate"
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={c.verificationUrl || `/verify-certificate/${c.verificationHash || c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Verify Certificate URL"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition inline-block"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteCert(c.id)}
                        title="Revoke Certificate"
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Issue Certificate Modal */}
      <IssueCertificateModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onCertificateIssued={handleCertificateIssued}
      />

    </div>
  );
};

export default AdminCertificates;
