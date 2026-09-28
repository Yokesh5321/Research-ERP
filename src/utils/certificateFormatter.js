/**
 * Certificate Data Formatter Engine
 * Takes Intern Data, Project Data, and Template selection to generate a normalized,
 * verified, and printable certificate object.
 */

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Academic Seal',
    badge: 'SRM Traditional',
    themeColor: '#1e3a8a', // Deep navy blue
    borderColor: '#d97706', // Gold accent
    fontStyle: 'serif',
    description: 'Formal academic certificate layout with gold borders and SRM emblem.',
  },
  {
    id: 'modern',
    name: 'Modern Tech Research',
    badge: 'Tech & AI ERP',
    themeColor: '#0f172a', // Dark slate
    borderColor: '#3b82f6', // Bright blue
    fontStyle: 'sans',
    description: 'Sleek, tech-focused layout featuring project metrics, domain tag & digital verification badge.',
  },
  {
    id: 'executive',
    name: 'Executive Gold Honor',
    badge: 'Excellence Award',
    themeColor: '#78350f', // Dark amber/gold
    borderColor: '#eab308', // Radiant gold
    fontStyle: 'serif',
    description: 'Distinction award for outstanding project contribution and research performance.',
  },
];

/**
 * Format raw intern and project data into a verified Certificate model.
 */
export function formatCertificateData({
  intern = {},
  project = {},
  templateId = 'classic',
  duration = '6 Months (2026)',
  grade = 'Outstanding (A+)',
  issuedBy = 'Dr. S. Ramasamy (Dean of Research, SRM IST)',
}) {
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const certId = `SRM-CERT-${now.getFullYear()}-${randomNum}`;
  const verificationHash = `v_${randomNum}_${Math.random().toString(36).substring(2, 7)}`;

  // Construct origin-relative verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const verificationUrl = `${origin}/verify-certificate/${verificationHash}`;

  return {
    id: certId,
    verificationHash,
    verificationUrl,
    issueDate: dateFormatted,
    status: 'Issued',
    grade,
    duration,
    issuedBy,
    template,

    // Intern Data Layer
    intern: {
      id: intern.id || intern.internId || 'wrk-001',
      name: intern.name || intern.internName || 'Intern Candidate',
      role: intern.role || intern.internRole || 'Research & Development Intern',
      department: intern.department || 'School of Computing / Engineering',
      email: intern.email || 'intern@srm.edu.in',
      attendance: intern.attendance || '95%',
      avatar: intern.avatar || null,
    },

    // Project Data Layer
    project: {
      id: project.id || project.projectId || 'proj-001',
      title: project.title || project.projectTitle || 'Advanced AI & Embedded Research',
      domain: project.domain || 'Machine Learning & Robotics',
      guideName: project.guideName || project.guide || 'Dr. R. K. Venkatesh',
      techStack: Array.isArray(project.techStack)
        ? project.techStack
        : (project.techStack || 'React, Node.js, Python').split(',').map((s) => s.trim()),
      description: project.description || 'Contributed actively to core architecture and module execution.',
    },
  };
}
