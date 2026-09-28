import React from 'react';

/**
 * Executive Gold Honor Certificate Template
 * Premium distinction award layout with metallic dual-stroke border,
 * achievement highlights, and gold badge graphics.
 */
const ExecutiveGoldTemplate = ({ cert }) => {
  const intern = cert.intern || {};
  const project = cert.project || {};

  return (
    <div
      id="printable-certificate"
      className="w-full bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-gray-900 border-[10px] border-amber-700 p-8 sm:p-12 rounded-xl shadow-2xl relative overflow-hidden font-serif select-none"
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Corner Ornaments */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

      <div className="h-full flex flex-col justify-between border-2 border-amber-500/80 p-6 sm:p-8 rounded-lg relative z-10 bg-white/70">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-1">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-2">
                <img src="/srm-seal.svg" alt="SRM Seal" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold uppercase tracking-widest text-amber-950 font-serif">
            SRM INSTITUTE OF SCIENCE & TECHNOLOGY
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase font-sans">
            EXCELLENCE IN RESEARCH & INNOVATION AWARD
          </p>
        </div>

        {/* Recipient info */}
        <div className="text-center my-3 space-y-3">
          <p className="text-xs sm:text-sm text-gray-600 italic font-sans">
            This Certificate of Executive Honor is presented to
          </p>
          
          <h2 className="text-3xl sm:text-5xl font-black text-amber-950 font-serif tracking-tight drop-shadow-sm">
            {intern.name || 'Intern Candidate'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-700 font-sans">
            in recognition of outstanding completion of research project
          </p>

          <div className="bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-y-2 border-amber-400 py-3 px-4 my-2">
            <h3 className="text-base sm:text-2xl font-bold text-amber-950 font-serif italic">
              "{project.title}"
            </h3>
            <p className="text-xs text-amber-800 font-sans mt-1">
              Domain: <span className="font-semibold">{project.domain}</span> | Mentor: <span className="font-semibold">{project.guideName}</span>
            </p>
          </div>

          <div className="flex justify-center gap-6 text-xs font-sans text-gray-800">
            <div>
              <span className="text-gray-500">Duration:</span> <span className="font-bold text-amber-900">{cert.duration}</span>
            </div>
            <div>
              <span className="text-gray-500">Rating:</span> <span className="font-bold text-emerald-800">{cert.grade}</span>
            </div>
            <div>
              <span className="text-gray-500">Attendance:</span> <span className="font-bold text-blue-900">{intern.attendance}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-amber-300 font-sans text-xs">
          <div className="text-center">
            <p className="font-serif italic font-bold text-amber-950 text-base">{project.guideName}</p>
            <div className="w-28 h-0.5 bg-amber-600 mx-auto my-1" />
            <p className="text-[10px] text-gray-600 font-semibold">Faculty Guide</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-amber-600 shadow-md">
              GOLD
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-1">NO: {cert.id}</p>
          </div>

          <div className="text-center">
            <p className="font-serif italic font-bold text-amber-950 text-base">{cert.issuedBy}</p>
            <div className="w-28 h-0.5 bg-amber-600 mx-auto my-1" />
            <p className="text-[10px] text-gray-600 font-semibold">Dean of Research</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveGoldTemplate;
