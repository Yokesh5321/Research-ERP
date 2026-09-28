import { formatCertificateData } from '../utils/certificateFormatter';

const API_BASE = '/api/certificates';

// Initial local storage key for client persistence fallback if backend server isn't running
const LOCAL_STORAGE_KEY = 'srm_erp_certificates';

const INITIAL_MOCK_CERTS = [
  formatCertificateData({
    intern: {
      id: 'wrk-001',
      name: 'Ananya Sharma',
      role: 'AI Research Intern',
      department: 'Computer Science & Engineering',
      email: 'ananya.s@srm.edu.in',
      attendance: '96%',
    },
    project: {
      id: 'proj-001',
      title: 'Autonomous Drone Swarm Navigation',
      domain: 'Robotics & AI',
      guideName: 'Dr. R. K. Venkatesh',
      techStack: ['Python', 'ROS2', 'PyTorch', 'C++'],
    },
    templateId: 'classic',
    duration: '6 Months (Mar 2026 - Sep 2026)',
    grade: 'Outstanding (A+)',
  }),
  formatCertificateData({
    intern: {
      id: 'wrk-002',
      name: 'Rohan Verma',
      role: 'Full Stack Developer Intern',
      department: 'Information Technology',
      email: 'rohan.v@srm.edu.in',
      attendance: '92%',
    },
    project: {
      id: 'proj-002',
      title: 'SRM Quantum Cloud Dashboard',
      domain: 'Cloud Infrastructure',
      guideName: 'Prof. Meera Nair',
      techStack: ['React', 'Node.js', 'Supabase', 'Tailwind'],
    },
    templateId: 'modern',
    duration: '3 Months (Jun 2026 - Sep 2026)',
    grade: 'Excellent (A)',
  }),
];

function getStoredCertificates() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading certificates from localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CERTS));
  return INITIAL_MOCK_CERTS;
}

function setStoredCertificates(certs) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(certs));
  } catch (e) {
    console.error('Error saving certificates to localStorage:', e);
  }
}

export const certificateService = {
  // Fetch all certificates
  async getCertificates() {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.certificates) {
          return data.certificates;
        }
      }
    } catch (err) {
      console.warn('Backend server not reachable, using local fallback:', err.message);
    }
    return getStoredCertificates();
  },

  // Fetch certificate by ID or Verification Hash
  async getCertificateById(idOrHash) {
    try {
      const res = await fetch(`${API_BASE}/${idOrHash}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.certificate) {
          return data.certificate;
        }
      }
    } catch (err) {
      console.warn('Backend API fetch error, checking local store:', err.message);
    }

    const certs = getStoredCertificates();
    return certs.find((c) => c.id === idOrHash || c.verificationHash === idOrHash || c.id.endsWith(idOrHash));
  },

  // Public certificate verification
  async verifyCertificate(hash) {
    try {
      const res = await fetch(`${API_BASE}/verify/${hash}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Backend verify API fallback:', err.message);
    }

    const certs = getStoredCertificates();
    const cert = certs.find((c) => c.verificationHash === hash || c.id === hash);
    if (cert) {
      return {
        verified: true,
        message: 'Authentic SRM Research Certificate',
        certificate: cert,
      };
    }
    return {
      verified: false,
      message: 'No valid certificate matches this verification hash.',
    };
  },

  // Generate / issue certificate
  async generateCertificate(payload) {
    const formatted = formatCertificateData({
      intern: {
        id: payload.internId,
        name: payload.internName,
        role: payload.internRole,
        department: payload.department,
        email: payload.email,
        attendance: payload.attendance,
      },
      project: {
        id: payload.projectId,
        title: payload.projectTitle,
        domain: payload.domain,
        guideName: payload.guideName,
        techStack: payload.techStack,
      },
      templateId: payload.templateId,
      duration: payload.duration,
      grade: payload.grade,
      issuedBy: payload.issuedBy,
    });

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.certificate) {
          // Update local store as well
          const certs = getStoredCertificates();
          certs.unshift(data.certificate);
          setStoredCertificates(certs);
          return data.certificate;
        }
      }
    } catch (err) {
      console.warn('Backend server save skipped, persisting locally:', err.message);
    }

    const certs = getStoredCertificates();
    certs.unshift(formatted);
    setStoredCertificates(certs);
    return formatted;
  },

  // Revoke certificate
  async deleteCertificate(id) {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    const certs = getStoredCertificates();
    const updated = certs.filter((c) => c.id !== id);
    setStoredCertificates(updated);
    return true;
  },
};
