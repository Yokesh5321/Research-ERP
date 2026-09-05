// Mock Auth Service

import { ADMIN_USER, WORKERS } from '../data/users';

const MOCK_CREDENTIALS = {
  'admin@researcherp.org': { password: 'admin123', user: ADMIN_USER },
  'priya.sharma@researcherp.org': { password: 'worker123', user: WORKERS[0] },
};

export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cred = MOCK_CREDENTIALS[email.toLowerCase()];
      if (cred && cred.password === password) {
        resolve(cred.user);
      } else {
        // Allow any worker email with password 'worker123'
        const worker = WORKERS.find((w) => w.email.toLowerCase() === email.toLowerCase());
        if (worker && password === 'worker123') {
          resolve(worker);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }
    }, 600);
  });
};

export const mockAdminLogin = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ADMIN_USER), 400);
  });
};

export const mockWorkerLogin = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(WORKERS[0]), 400);
  });
};

export const mockLogout = () => {
  return new Promise((resolve) => setTimeout(resolve, 200));
};
