const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('milkman_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (login):', err);
      return { 
        success: false, 
        message: 'Unable to connect to the server. Please check your internet connection.' 
      };
    }
  },

  verifySession: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (verifySession):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  register: async (registerData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (register):', err);
      return { 
        success: false, 
        message: 'Unable to connect to the server. Registration requires an active server connection.' 
      };
    }
  },

  // Customers
  getCustomers: async (query = '') => {
    try {
      const res = await fetch(`${API_BASE}/customers?q=${encodeURIComponent(query)}`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getCustomers):', err);
      return { success: false, customers: [], message: 'Unable to connect to the server.' };
    }
  },

  addCustomer: async (customerData) => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (addCustomer):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  deleteCustomer: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (deleteCustomer):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  getCustomerById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getCustomerById):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  // Collections
  getCollections: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/collections?${query}`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getCollections):', err);
      return { success: false, collections: [] };
    }
  },

  saveCollection: async (collectionData) => {
    try {
      const res = await fetch(`${API_BASE}/collections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(collectionData)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (saveCollection):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  updateCollection: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (updateCollection):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  deleteCollection: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (deleteCollection):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  // Settings
  getRates: async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/pricing`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getRates):', err);
      return { success: false, rates: { cow_rate: 20, buffalo_rate: 30 } };
    }
  },

  updateRates: async (cow_rate, buffalo_rate) => {
    try {
      const res = await fetch(`${API_BASE}/settings/pricing`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cow_rate, buffalo_rate })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error (updateRates):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/dashboard`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getDashboardMetrics):', err);
      return { success: false, message: 'Unable to connect to the server.' };
    }
  },

  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/audit`);
      return await res.json();
    } catch (err) {
      console.error('API Error (getAuditLogs):', err);
      return { success: true, auditLogs: [] };
    }
  },

  // Reset All System Data
  resetAllData: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Unable to connect to the server.' };
    }
  }
};
