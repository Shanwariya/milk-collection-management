import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [rates, setRates] = useState({ cow_rate: 20, buffalo_rate: 30 });
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Dark/Light Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('milkman_theme');
    return saved ? saved === 'dark' : true; // Default dark theme for modern rich aesthetic
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('milkman_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('milkman_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      let [custRes, colRes, rateRes, dashRes] = await Promise.all([
        api.getCustomers(),
        api.getCollections(),
        api.getRates(),
        api.getDashboardMetrics()
      ]);

      // Detect if legacy sample data is returned from backend or offline cache
      const legacyNames = ['lakshmi', 'lakshmipriya', 'lakshana', 'sita devi', 'radha rani', 'anita sharma'];
      if (custRes.success && custRes.customers && custRes.customers.some(c => c.name && legacyNames.includes(c.name.toLowerCase()))) {
        await api.resetAllData();
        [custRes, colRes, rateRes, dashRes] = await Promise.all([
          api.getCustomers(),
          api.getCollections(),
          api.getRates(),
          api.getDashboardMetrics()
        ]);
      }

      if (custRes.success) setCustomers(custRes.customers);
      if (colRes.success) setCollections(colRes.collections);
      if (rateRes.success) setRates(rateRes.rates);
      if (dashRes.success) setDashboardMetrics(dashRes);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addCustomer = async (data) => {
    const res = await api.addCustomer(data);
    if (res.success) {
      showToast(res.message);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to register customer', 'error');
    return res;
  };

  const deleteCustomer = async (id) => {
    const res = await api.deleteCustomer(id);
    if (res.success) {
      showToast(res.message);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to remove user', 'error');
    return res;
  };

  const saveCollection = async (data) => {
    const res = await api.saveCollection(data);
    if (res.success) {
      showToast(res.message);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to save milk collection', 'error');
    return res;
  };

  const updateCollection = async (id, data) => {
    const res = await api.updateCollection(id, data);
    if (res.success) {
      showToast(res.message);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to update record', 'error');
    return res;
  };

  const deleteCollection = async (id) => {
    const res = await api.deleteCollection(id);
    if (res.success) {
      showToast(res.message);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to delete record', 'error');
    return res;
  };

  const updateRates = async (cow, buf) => {
    const res = await api.updateRates(cow, buf);
    if (res.success) {
      showToast(res.message);
      setRates(res.rates);
      await refreshData();
      return res;
    }
    showToast(res.message || 'Failed to update rates', 'error');
    return res;
  };

  return (
    <AppContext.Provider value={{
      customers,
      collections,
      rates,
      dashboardMetrics,
      loading,
      toast,
      darkMode,
      toggleDarkMode,
      showToast,
      refreshData,
      addCustomer,
      deleteCustomer,
      saveCollection,
      updateCollection,
      deleteCollection,
      updateRates
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
