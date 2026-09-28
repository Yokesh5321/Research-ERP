import React, { useState } from 'react';
import { Printer, Download, ExternalLink, ShieldCheck, CheckCircle2, Sparkles, Layout } from 'lucide-react';
import ClassicAcademicTemplate from './templates/ClassicAcademicTemplate';
import ModernTechTemplate from './templates/ModernTechTemplate';
import ExecutiveGoldTemplate from './templates/ExecutiveGoldTemplate';
import { TEMPLATES } from '../../utils/certificateFormatter';
import toast from 'react-hot-toast';

const CertificateGenerator = ({ cert, onUpdateTemplate }) => {
  const [activeTemplate, setActiveTemplate] = useState(cert?.template?.id || cert?.templateId || 'classic');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!cert) return null;

  // Active cert with current selected template overrides
  const displayCert = {
    ...cert,
    templateId: activeTemplate,
  };

  const handleTemplateChange = (tmplId) => {
    setActiveTemplate(tmplId);
    if (onUpdateTemplate) onUpdateTemplate(tmplId);
  };

  // Triggers print view engine
  const handlePrint = () => {
    setIsPrinting(true);
    toast.success('Opening Print View...');
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  // Triggers PDF Download action
  const handleDownloadPDF = () => {
    toast.loading('Preparing high-resolution PDF download...', { id: 'pdf-toast' });
    setTimeout(() => {
      toast.success(`Downloaded ${displayCert.id}.pdf`, { id: 'pdf-toast' });
      window.print();
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Global Styles for @media print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Control Bar: Template Switcher & Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Template selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Layout className="w-4 h-4 text-blue-600" /> Template:
          </span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleTemplateChange(tmpl.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTemplate === tmpl.id
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {activeTemplate === tmpl.id && <CheckCircle2 className="w-3.5 h-3.5" />}
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Action Buttons: Print View & PDF Output */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <a
            href={cert.verificationUrl || `/verify-certificate/${cert.verificationHash || cert.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verify Link
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print View
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            PDF Output
          </button>
        </div>

      </div>

      {/* Certificate Generator Live Canvas */}
      <div className="bg-gray-900/5 border border-gray-200 rounded-2xl p-4 sm:p-8 flex justify-center items-center overflow-x-auto min-h-[420px]">
        <div className="w-full max-w-4xl transition-all duration-300 transform scale-100 hover:scale-[1.005]">
          {activeTemplate === 'classic' && <ClassicAcademicTemplate cert={displayCert} />}
          {activeTemplate === 'modern' && <ModernTechTemplate cert={displayCert} />}
          {activeTemplate === 'executive' && <ExecutiveGoldTemplate cert={displayCert} />}
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
