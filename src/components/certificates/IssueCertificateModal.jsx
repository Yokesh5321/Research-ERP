import React, { useState } from 'react';
import { X, Award, Sparkles, User, FolderOpen, Calendar, CheckCircle2 } from 'lucide-react';
import { WORKERS } from '../../data/users';
import { PROJECTS } from '../../data/projects';
import { TEMPLATES } from '../../utils/certificateFormatter';
import toast from 'react-hot-toast';

const IssueCertificateModal = ({ isOpen, onClose, onCertificateIssued }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState(WORKERS[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id || '');
  const [templateId, setTemplateId] = useState('classic');
  const [duration, setDuration] = useState('6 Months (Mar 2026 - Sep 2026)');
  const [grade, setGrade] = useState('Outstanding (A+)');
  const [issuedBy, setIssuedBy] = useState('Dr. S. Ramasamy (Dean of Research)');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const worker = WORKERS.find((w) => w.id === selectedWorkerId) || WORKERS[0];
    const project = PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0];

    const payload = {
      internId: worker.id,
      internName: worker.name,
      internRole: worker.role || 'Research Intern',
      department: worker.department || 'School of Computing',
      email: worker.email || '',
      attendance: `${worker.attendanceRate || 95}%`,

      projectId: project.id,
      projectTitle: project.title,
      domain: project.domain || 'Technology & Engineering',
      guideName: project.lead || 'Dr. SRM Research Guide',
      techStack: project.tags || ['React', 'Node.js', 'Python'],

      templateId,
      duration,
      grade,
      issuedBy,
    };

    onCertificateIssued(payload);
    toast.success(`Issued certificate for ${worker.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Issue Research Certificate</h2>
              <p className="text-xs text-gray-500">Combine Intern Data + Project Data + Selected Template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Step 1: Intern Selection */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> Select Student / Intern:
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {WORKERS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.role} ({w.department || 'Engineering'})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Project Selection */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" /> Select Completed Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — ({p.domain || 'Research'})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Template Selector */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Choose Certificate Template:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {TEMPLATES.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => setTemplateId(tmpl.id)}
                  className={`p-3 border rounded-xl text-left transition-all relative ${
                    templateId === tmpl.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {templateId === tmpl.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                  )}
                  <p className="font-bold text-gray-900 text-xs mb-0.5">{tmpl.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{tmpl.badge}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">Duration Period:</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">Performance Grade:</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-1 block">Issuing Authority:</label>
            <input
              type="text"
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" /> Issue Certificate
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default IssueCertificateModal;
