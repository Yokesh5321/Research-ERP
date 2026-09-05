import { createContext, useContext, useState, useCallback } from 'react';
import { mockLogin, mockAdminLogin, mockWorkerLogin, mockLogout } from '../services/mockAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await mockLogin(email, password);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await mockAdminLogin();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsWorker = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await mockWorkerLogin();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await mockLogout();
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginAsAdmin, loginAsWorker, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
