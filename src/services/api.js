const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Purge legacy sample data from local storage if present
const cleanLegacyOfflineData = () => {
  try {
    const custs = JSON.parse(localStorage.getItem('offline_customers') || '[]');
    const cols = JSON.parse(localStorage.getItem('offline_collections') || '[]');
    const legacyNames = ['lakshmi', 'lakshmipriya', 'lakshana', 'sita devi', 'radha rani', 'anita sharma'];
    
    if (custs.some(c => c.name && legacyNames.includes(c.name.toLowerCase()))) {
      localStorage.removeItem('offline_customers');
      localStorage.removeItem('offline_collections');
    }
  } catch (e) {
    // Ignore error
  }
};
cleanLegacyOfflineData();

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
      console.warn('Backend unavailable, trying offline auth fallback', err);
      if ((username === 'admin' && password === 'admin123') || (username === 'milkman' && password === 'milk123')) {
        const role = username === 'admin' ? 'admin' : 'milkman';
        return {
          success: true,
          token: 'offline_mock_token',
          user: { username, role, fullName: username === 'admin' ? 'Dairy Admin' : 'Ramesh Milkman' }
        };
      }
      const localUsers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const found = localUsers.find(u => u.username && u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
      if (found) {
        return {
          success: true,
          token: 'offline_mock_token',
          user: { username: found.username, role: 'customer', fullName: found.name, customer_id: found.id }
        };
      }
      return { success: false, message: 'Invalid Username or Password' };
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
      console.warn('Backend offline, registering locally');
      const local = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const seq = local.length + 1;
      const id = 'M' + String(seq).padStart(4, '0');
      const newCust = {
        id,
        username: registerData.username,
        password: registerData.password,
        name: registerData.name,
        phone: registerData.phone || '',
        address: registerData.address || '',
        notes: registerData.notes || '',
        role: 'customer',
        created_at: new Date().toISOString()
      };
      local.unshift(newCust);
      localStorage.setItem('offline_customers', JSON.stringify(local));
      return { 
        success: true, 
        token: 'offline_mock_token',
        user: { username: newCust.username, role: 'customer', fullName: newCust.name, customer_id: newCust.id },
        message: `✅ Registered successfully with ID: ${id} (Offline)`
      };
    }
  },


  // Customers
  getCustomers: async (query = '') => {
    try {
      const res = await fetch(`${API_BASE}/customers?q=${encodeURIComponent(query)}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using fallback');
      const local = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      if (query) {
        const q = query.toLowerCase();
        const filtered = local.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
        return { success: true, customers: filtered };
      }
      return { success: true, customers: local };
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
      console.warn('Backend offline, saving customer locally');
      const local = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const seq = local.length + 11;
      const newCust = {
        id: 'M' + String(seq).padStart(4, '0'),
        name: customerData.name,
        phone: customerData.phone || '',
        address: customerData.address || '',
        notes: customerData.notes || '',
        created_at: new Date().toISOString()
      };
      local.unshift(newCust);
      localStorage.setItem('offline_customers', JSON.stringify(local));
      return { success: true, customer: newCust, message: `✅ Woman registered with ID: ${newCust.id} (Offline)` };
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
      console.warn('Backend offline, deleting locally');
      let local = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      local = local.filter(c => c.id.toLowerCase() !== id.toLowerCase() && (!c.username || c.username.toLowerCase() !== id.toLowerCase()));
      localStorage.setItem('offline_customers', JSON.stringify(local));
      return { success: true, message: '✅ Woman user removed locally' };
    }
  },

  getCustomerById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, profile fallback');
      return { success: false, message: 'Profile offline data unavailable' };
    }
  },

  // Collections
  getCollections: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/collections?${query}`);
      return await res.json();
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('offline_collections') || '[]');
      return { success: true, collections: local };
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
      console.warn('Backend offline, saving collection locally');
      const local = JSON.parse(localStorage.getItem('offline_collections') || '[]');
      const rates = JSON.parse(localStorage.getItem('offline_rates') || '{"cow_rate":20,"buffalo_rate":30}');
      const rate = collectionData.milk_type === 'Cow' ? rates.cow_rate : rates.buffalo_rate;
      const qty = parseFloat(collectionData.quantity);
      const total = qty * rate;

      const record = {
        id: Date.now(),
        customer_id: collectionData.customer_id,
        customer_name: collectionData.customer_name,
        collection_date: collectionData.collection_date || new Date().toISOString().split('T')[0],
        collection_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shift: collectionData.shift || 'Morning',
        milk_type: collectionData.milk_type || 'Cow',
        quantity: qty,
        rate,
        total_amount: total,
        recorded_at: new Date().toISOString()
      };
      local.unshift(record);
      localStorage.setItem('offline_collections', JSON.stringify(local));
      return { success: true, record, message: `✅ Milk Collection Saved Successfully (${qty}L ${record.milk_type} = ₹${total})` };
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
      return { success: false, message: 'Update failed' };
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
      return { success: false, message: 'Delete failed' };
    }
  },

  // Settings
  getRates: async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/pricing`);
      return await res.json();
    } catch (err) {
      const rates = JSON.parse(localStorage.getItem('offline_rates') || '{"cow_rate":20,"buffalo_rate":30}');
      return { success: true, rates };
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
      const rates = { cow_rate: parseFloat(cow_rate), buffalo_rate: parseFloat(buffalo_rate) };
      localStorage.setItem('offline_rates', JSON.stringify(rates));
      return { success: true, rates, message: '✅ Milk prices updated offline!' };
    }
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/dashboard`);
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Dashboard metrics offline' };
    }
  },

  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/audit`);
      return await res.json();
    } catch (err) {
      return { success: true, auditLogs: [] };
    }
  },

  // Reset All System Data
  resetAllData: async () => {
    localStorage.removeItem('offline_customers');
    localStorage.removeItem('offline_collections');
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Reset offline' };
    }
  }
};
