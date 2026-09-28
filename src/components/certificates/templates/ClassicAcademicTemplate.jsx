import React from 'react';

/**
 * Classic Academic SRM Certificate Template
 * Features formal golden inner border, SRM Seal header, classic typography,
 * guide & dean signature lines, and QR verification stamp.
 */
const ClassicAcademicTemplate = ({ cert }) => {
  const intern = cert.intern || {};
  const project = cert.project || {};

  return (
    <div
      id="printable-certificate"
      className="w-full bg-white text-gray-900 border-[12px] border-amber-600 p-8 sm:p-12 rounded-lg shadow-2xl relative overflow-hidden font-serif select-none transition-all"
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Inner Decorative Golden Border */}
      <div className="border-2 border-amber-500/60 p-6 sm:p-8 h-full flex flex-col justify-between relative z-10 bg-amber-50/10">
        
        {/* Header: SRM Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-3">
            <img src="/srm-seal.svg" alt="SRM Seal" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-widest text-blue-900 drop-shadow-sm mt-2">
            SRM Institute of Science & Technology
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-amber-800 uppercase font-sans">
            Directorate of Research & Innovation · Research ERP Portal
          </p>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto my-3" />
          <h2 className="text-xl sm:text-3xl font-bold italic text-amber-900 font-serif">
            Certificate of Research Internship
          </h2>
        </div>

        {/* Body Text */}
        <div className="text-center space-y-4 my-4 max-w-3xl mx-auto">
          <p className="text-sm sm:text-base italic text-gray-700 font-sans">
            This is to proudly certify that
          </p>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 underline decoration-amber-500/50 decoration-2 underline-offset-8">
            {intern.name || 'Intern Candidate'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-sans">
            Department of <span className="font-semibold text-gray-900">{intern.department}</span>
          </p>

          <p className="text-xs sm:text-base text-gray-800 leading-relaxed font-sans pt-2">
            has successfully completed the research internship duration of{' '}
            <span className="font-bold text-blue-900">{cert.duration || '6 Months'}</span> working on the project titled
          </p>

          <div className="bg-amber-100/50 border border-amber-300 rounded-lg p-3 sm:p-4 my-2">
            <p className="text-base sm:text-xl font-bold text-amber-950 font-serif">
              "{project.title}"
            </p>
            {project.domain && (
              <span className="inline-block mt-2 px-3 py-1 bg-amber-800 text-amber-100 text-[10px] sm:text-xs font-sans font-medium rounded-full">
                Domain: {project.domain}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-700 font-sans">
            Performance Rating: <span className="font-bold text-green-800">{cert.grade}</span> | Attendance Record: <span className="font-bold text-blue-800">{intern.attendance}</span>
          </p>
        </div>

        {/* Footer: Signatures, Certificate ID & QR Code */}
        <div className="flex items-end justify-between pt-6 border-t border-amber-200/80 font-sans text-xs">
          {/* Guide Signature */}
          <div className="text-center space-y-1">
            <div className="h-10 flex items-center justify-center italic text-blue-900 font-serif text-lg font-bold">
              {project.guideName || 'Dr. R. K. Venkatesh'}
            </div>
            <div className="w-36 h-0.5 bg-gray-400 mx-auto" />
            <p className="font-bold text-gray-800">{project.guideName}</p>
            <p className="text-[10px] text-gray-500">Research Project Guide</p>
          </div>

          {/* Official Seal & QR Verification Code */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center p-1 text-[9px] text-center font-bold text-amber-900 shadow-inner">
              <span>SRM OFFICIAL SEAL</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {cert.id}</p>
            <p className="text-[9px] text-blue-600 underline font-mono cursor-pointer">
              Verify: {cert.verificationHash}
            </p>
          </div>

          {/* Dean Signature */}
          <div className="text-center space-y-1">
            <div className="h-10 flex items-center justify-center italic text-blue-900 font-serif text-lg font-bold">
              Dr. S. Ramasamy
            </div>
            <div className="w-36 h-0.5 bg-gray-400 mx-auto" />
            <p className="font-bold text-gray-800">{cert.issuedBy || 'Dean of Research'}</p>
            <p className="text-[10px] text-gray-500">SRM IST Chennai</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassicAcademicTemplate;
