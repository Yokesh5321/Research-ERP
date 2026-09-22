/**
 * Research ERP - Comprehensive API Service Client
 * Connects frontend React client to Node.js/Express backend API (/api)
 */

const BASE_URL = '/api';

const request = async (endpoint, options = {}) => {
  let token = null;
  try {
    const rawSession = localStorage.getItem('sb-nsunkgfvlgxvdjxfioth-auth-token');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      token = parsed?.access_token;
    }
  } catch (e) {
    // Ignore storage parse error
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Client] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth API
  auth: {
    login: (email, password, loginType = 'candidate') =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, loginType }),
      }),
    me: () => request('/auth/me'),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },

  // Projects API
  projects: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/projects${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/projects/${id}`),
    create: (project) => request('/projects', { method: 'POST', body: JSON.stringify(project) }),
    delete: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  },

  // Tasks API
  tasks: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/tasks${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/tasks/${id}`),
    create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id, updates) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  },

  // Meetings API
  meetings: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/meetings${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/meetings/${id}`),
    create: (meeting) => request('/meetings', { method: 'POST', body: JSON.stringify(meeting) }),
    update: (id, updates) => request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/meetings/${id}`, { method: 'DELETE' }),
  },

  // Documents API
  documents: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/documents${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/documents/${id}`),
    create: (doc) => request('/documents', { method: 'POST', body: JSON.stringify(doc) }),
    delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  },

  // Notifications API
  notifications: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/notifications${query ? `?${query}` : ''}`);
    },
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: (userId) => request('/notifications/read-all', { method: 'PATCH', body: JSON.stringify({ userId }) }),
    create: (notif) => request('/notifications', { method: 'POST', body: JSON.stringify(notif) }),
  },

  // Profiles API
  profiles: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/profiles${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/profiles/${id}`),
    update: (id, updates) => request(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  },

  // GitHub Integration API
  github: {
    getRepos: () => request('/github/repos'),
    getCommits: () => request('/github/commits'),
  },

  // Code Execution Engine (Sandbox / Testing)
  executions: {
    run: (payload) =>
      request('/executions/run', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getAll: () => request('/executions'),
    getById: (id) => request(`/executions/${id}`),
  },

  // Attendance Management API (Admin Only)
  attendance: {
    getSummary: (date) => request(`/attendance/summary${date ? `?date=${date}` : ''}`),
    getCandidates: () => request('/attendance/candidates'),
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/attendance${query ? `?${query}` : ''}`);
    },
    mark: (record) => request('/attendance', { method: 'POST', body: JSON.stringify(record) }),
    bulkMark: (payload) => request('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, updates) => request(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
    getCandidateSummary: (candidateId) => request(`/attendance/candidate/${candidateId}/summary`),
  },
};

export default api;
