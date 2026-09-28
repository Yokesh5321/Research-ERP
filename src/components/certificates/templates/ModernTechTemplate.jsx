import React from 'react';

/**
 * Modern Tech Research Certificate Template
 * Features sleek slate dark header gradient, tech badges, modern sans typography,
 * code execution metrics tag, and digital verification seal.
 */
const ModernTechTemplate = ({ cert }) => {
  const intern = cert.intern || {};
  const project = cert.project || {};
  const techStack = project.techStack || [];

  return (
    <div
      id="printable-certificate"
      className="w-full bg-slate-900 text-white rounded-xl shadow-2xl p-8 sm:p-12 relative overflow-hidden font-sans select-none border border-slate-800"
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="h-full flex flex-col justify-between relative z-10 border border-slate-700/60 rounded-lg p-6 sm:p-8 bg-slate-900/90 backdrop-blur-md">
        
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img src="/srm-seal.svg" alt="SRM Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
            <div>
              <p className="text-base sm:text-lg font-bold tracking-wider text-blue-400">SRM RESEARCH ERP</p>
              <p className="text-[11px] text-slate-400 font-mono">CENTER FOR RESEARCH & TECHNOLOGY</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-mono">
              VERIFIED TECH CERTIFICATE
            </span>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Issued: {cert.issueDate}</p>
          </div>
        </div>

        {/* Certificate Title & Recipient */}
        <div className="text-center my-4 space-y-3">
          <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-semibold">
            CERTIFICATE OF COMPLETED RESEARCH PROJECT
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-200">
            {intern.name || 'Intern Candidate'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Role: <span className="text-blue-300 font-semibold">{intern.role}</span> ({intern.department})
          </p>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto pt-2">
            has successfully architected, developed, and deployed research modules for the project:
          </p>

          <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-4 my-3 text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">PROJECT TITLE</span>
              <span className="text-[10px] font-mono text-slate-400">GRADE: {cert.grade}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-3">
              {project.title}
            </h2>

            {/* Tech Stack Pills */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400 font-mono mr-1">TECH STACK:</span>
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-700 text-slate-200 text-[10px] font-mono rounded border border-slate-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info & Signatures */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-800 text-xs">
          <div>
            <p className="text-[11px] text-slate-400">Mentor & Guide</p>
            <p className="font-bold text-slate-200 text-sm">{project.guideName}</p>
            <p className="text-[10px] text-slate-500">Lead Research Faculty</p>
          </div>

          <div className="text-center">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-mono font-bold mb-1">
              STATUS: AUTHENTICATED
            </div>
            <p className="text-[9px] text-slate-400 font-mono">HASH: {cert.verificationHash}</p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-slate-400">Issuing Authority</p>
            <p className="font-bold text-slate-200 text-sm">{cert.issuedBy}</p>
            <p className="text-[10px] text-slate-500">SRM Research Directorate</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModernTechTemplate;
