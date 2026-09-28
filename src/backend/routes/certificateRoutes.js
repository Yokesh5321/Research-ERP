import express from 'express';

const router = express.Router();

// Mock in-memory store initialized with realistic initial data
let certificates = [
  {
    id: 'CERT-2026-8941',
    internId: 'wrk-001',
    internName: 'Ananya Sharma',
    internRole: 'AI Research Intern',
    department: 'Computer Science & Engineering',
    email: 'ananya.s@srm.edu.in',
    attendance: '96%',
    projectId: 'proj-001',
    projectTitle: 'Autonomous Drone Swarm Navigation',
    domain: 'Robotics & AI',
    guideName: 'Dr. R. K. Venkatesh',
    techStack: ['Python', 'ROS2', 'PyTorch', 'C++'],
    templateId: 'classic',
    issueDate: '2026-09-20',
    duration: '6 Months (Mar 2026 - Sep 2026)',
    status: 'Issued',
    issuedBy: 'Dr. S. Ramasamy (Dean Research)',
    grade: 'Outstanding (A+)',
    verificationHash: 'v_8941_a7x9b',
  },
  {
    id: 'CERT-2026-8942',
    internId: 'wrk-002',
    internName: 'Rohan Verma',
    internRole: 'Full Stack Developer Intern',
    department: 'Information Technology',
    email: 'rohan.v@srm.edu.in',
    attendance: '92%',
    projectId: 'proj-002',
    projectTitle: 'SRM Quantum Cloud Dashboard',
    domain: 'Cloud Infrastructure',
    guideName: 'Prof. Meera Nair',
    techStack: ['React', 'Node.js', 'Supabase', 'Tailwind'],
    templateId: 'modern',
    issueDate: '2026-09-22',
    duration: '3 Months (Jun 2026 - Sep 2026)',
    status: 'Issued',
    issuedBy: 'Dr. S. Ramasamy (Dean Research)',
    grade: 'Excellent (A)',
    verificationHash: 'v_8942_k3m8p',
  },
];

// GET /api/certificates - List all issued certificates
router.get('/', (req, res) => {
  const { search, template, status } = req.query;
  let filtered = [...certificates];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.internName.toLowerCase().includes(q) ||
        c.projectTitle.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }

  if (template) {
    filtered = filtered.filter((c) => c.templateId === template);
  }

  if (status) {
    filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    count: filtered.length,
    certificates: filtered,
  });
});

// GET /api/certificates/:id - Single certificate detail
router.get('/:id', (req, res) => {
  const cert = certificates.find((c) => c.id === req.params.id || c.verificationHash === req.params.id);

  if (!cert) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found',
    });
  }

  res.json({
    success: true,
    certificate: cert,
  });
});

// GET /api/certificates/verify/:hash - Public verification
router.get('/verify/:hash', (req, res) => {
  const cert = certificates.find((c) => c.verificationHash === req.params.hash || c.id === req.params.hash);

  if (!cert) {
    return res.json({
      verified: false,
      message: 'No valid SRM Research ERP certificate matches this ID or verification hash.',
    });
  }

  res.json({
    verified: true,
    message: 'Authentic SRM Research Certificate',
    certificate: cert,
  });
});

// POST /api/certificates/generate - Issue new certificate
router.post('/generate', (req, res) => {
  const {
    internId,
    internName,
    internRole,
    department,
    email,
    attendance,
    projectId,
    projectTitle,
    domain,
    guideName,
    techStack,
    templateId,
    duration,
    grade,
    issuedBy,
  } = req.body;

  if (!internName || !projectTitle) {
    return res.status(400).json({
      success: false,
      message: 'Intern Name and Project Title are required.',
    });
  }

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const hash = `v_${randNum}_${Math.random().toString(36).substring(2, 7)}`;
  const certId = `CERT-2026-${randNum}`;

  const newCert = {
    id: certId,
    internId: internId || `wrk-${randNum}`,
    internName,
    internRole: internRole || 'Research Intern',
    department: department || 'Engineering & Technology',
    email: email || '',
    attendance: attendance || '95%',
    projectId: projectId || `proj-${randNum}`,
    projectTitle,
    domain: domain || 'Research & Development',
    guideName: guideName || 'Dr. SRM Guide',
    techStack: Array.isArray(techStack) ? techStack : (techStack || 'React, Node.js').split(',').map((s) => s.trim()),
    templateId: templateId || 'classic',
    issueDate: new Date().toISOString().split('T')[0],
    duration: duration || '6 Months (2026)',
    status: 'Issued',
    issuedBy: issuedBy || 'Dr. S. Ramasamy (Dean Research)',
    grade: grade || 'Outstanding (A+)',
    verificationHash: hash,
  };

  certificates.unshift(newCert);

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    certificate: newCert,
  });
});

// DELETE /api/certificates/:id - Revoke certificate
router.delete('/:id', (req, res) => {
  const idx = certificates.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  certificates.splice(idx, 1);
  res.json({ success: true, message: 'Certificate revoked successfully' });
});

export default router;
