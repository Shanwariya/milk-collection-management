import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('milkman_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('milkman_token') || '');
  const [showRateModal, setShowRateModal] = useState(false);

  useEffect(() => {
    if (token) {
      api.verifySession().then(res => {
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('milkman_user', JSON.stringify(res.user));
        } else {
          logout();
        }
      });
    }
  }, []);

  const dismissRateModal = () => {
    setShowRateModal(false);
  };

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('milkman_user', JSON.stringify(res.user));
      localStorage.setItem('milkman_token', res.token);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (registerData) => {
    const res = await api.register(registerData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('milkman_user', JSON.stringify(res.user));
      localStorage.setItem('milkman_token', res.token);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('milkman_user');
    localStorage.removeItem('milkman_token');
  };

  const isMilkman = user?.role === 'milkman' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isAdmin: user?.role === 'admin',
      isMilkman,
      isCustomer,
      showRateModal,
      setShowRateModal,
      dismissRateModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
