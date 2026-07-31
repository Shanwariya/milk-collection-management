import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'milkman_super_secret_jwt_key_2026';

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = { username: 'milkman', role: 'milkman' };
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = { username: 'milkman', role: 'milkman' };
    else req.user = user;
    next();
  });
};

// 1. LOGIN & REGISTER API
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const authenticated = await db.authenticateUser(username, password);
  if (authenticated) {
    const role = authenticated.role;
    const fullName = authenticated.full_name || authenticated.username;
    const token = jwt.sign({ username: authenticated.username, role, fullName, customer_id: authenticated.customer_id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      token,
      user: { 
        username: authenticated.username, 
        role, 
        fullName,
        customer_id: authenticated.customer_id || null
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid Username or Password' });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, phone, address, notes } = req.body;
  if (!username || !username.trim() || !password || !name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Username, password, and Full Name are required' });
  }

  const result = await db.registerCustomer({ username, password, name, phone, address, notes });
  if (result.error) {
    return res.status(400).json({ success: false, message: result.error });
  }

  const token = jwt.sign({ username: result.customer.username, role: 'customer', fullName: result.customer.name, customer_id: result.customer.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    token,
    user: {
      username: result.customer.username,
      role: 'customer',
      fullName: result.customer.name,
      customer_id: result.customer.id
    },
    message: `✅ Registered successfully! Your Supplier ID is ${result.customer.id}`
  });
});


// 2. CUSTOMERS API
app.get('/api/customers', async (req, res) => {
  const { q } = req.query;
  let customers = await db.getCustomers();
  if (q) {
    const query = q.toLowerCase();
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query) ||
      (c.username && c.username.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query))
    );
  }
  res.json({ success: true, customers });
});

app.post('/api/customers', async (req, res) => {
  const { name, phone, address, notes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Woman Name is required' });
  }
  const newCust = await db.addCustomer({ name, phone, address, notes });
  res.json({ success: true, customer: newCust, message: `✅ Woman registered with ID: ${newCust.id}` });
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'milkman' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only Milkman can remove users' });
  }
  const deleted = await db.deleteCustomer(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, message: '✅ Woman user removed successfully' });
});


app.get('/api/customers/:id', async (req, res) => {
  const cust = await db.getCustomerById(req.params.id);
  if (!cust) return res.status(404).json({ success: false, message: 'Customer not found' });
  
  const todayStr = new Date().toISOString().split('T')[0];
  const allCollections = await db.getCollections();
  const allCols = allCollections.filter(c => c.customer_id.toLowerCase() === cust.id.toLowerCase());
  const todayCols = allCols.filter(c => c.collection_date === todayStr);

  let mCow = 0, mBuf = 0, eCow = 0, eBuf = 0;
  todayCols.forEach(c => {
    if (c.shift === 'Morning') {
      if (c.milk_type === 'Cow') mCow += c.quantity;
      if (c.milk_type === 'Buffalo') mBuf += c.quantity;
    } else if (c.shift === 'Evening') {
      if (c.milk_type === 'Cow') eCow += c.quantity;
      if (c.milk_type === 'Buffalo') eBuf += c.quantity;
    }
  });

  const totalCowLiters = allCols.filter(c => c.milk_type === 'Cow').reduce((acc, c) => acc + c.quantity, 0);
  const totalBufLiters = allCols.filter(c => c.milk_type === 'Buffalo').reduce((acc, c) => acc + c.quantity, 0);
  const totalAmount = allCols.reduce((acc, c) => acc + c.total_amount, 0);

  res.json({
    success: true,
    customer: cust,
    todaySummary: {
      morning: { cow: mCow, buffalo: mBuf, total: mCow + mBuf },
      evening: { cow: eCow, buffalo: eBuf, total: eCow + eBuf },
      todayTotalLiters: mCow + mBuf + eCow + eBuf,
      todayTotalAmount: todayCols.reduce((acc, c) => acc + c.total_amount, 0)
    },
    overallSummary: {
      totalCowLiters,
      totalBufLiters,
      grandTotalLiters: totalCowLiters + totalBufLiters,
      totalAmount
    },
    history: allCols
  });
});

// 3. MILK COLLECTIONS API
app.get('/api/collections', async (req, res) => {
  let collections = await db.getCollections();
  const { date, startDate, endDate, customer_id, milk_type, shift } = req.query;

  if (date) {
    collections = collections.filter(c => c.collection_date === date);
  }
  if (startDate && endDate) {
    collections = collections.filter(c => c.collection_date >= startDate && c.collection_date <= endDate);
  }
  if (customer_id) {
    collections = collections.filter(c => c.customer_id.toLowerCase() === customer_id.toLowerCase());
  }
  if (milk_type) {
    collections = collections.filter(c => c.milk_type.toLowerCase() === milk_type.toLowerCase());
  }
  if (shift) {
    collections = collections.filter(c => c.shift.toLowerCase() === shift.toLowerCase());
  }

  res.json({ success: true, collections });
});

app.post('/api/collections', authenticateToken, async (req, res) => {
  const { customer_id, customer_name, shift, milk_type, quantity, collection_date, collection_time } = req.body;
  if (!customer_id || !quantity || parseFloat(quantity) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid Customer ID and Quantity required' });
  }

  const record = await db.addCollection({
    customer_id,
    customer_name: customer_name || customer_id,
    shift: shift || 'Morning',
    milk_type: milk_type || 'Cow',
    quantity: parseFloat(quantity),
    collection_date,
    collection_time
  }, req.user.username);

  res.json({
    success: true,
    record,
    message: `✅ Milk Collection Saved Successfully (${record.quantity}L ${record.milk_type} = ₹${record.total_amount})`
  });
});

app.put('/api/collections/:id', authenticateToken, async (req, res) => {
  const updated = await db.updateCollection(req.params.id, req.body, req.user.username);
  if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, record: updated, message: '✅ Entry updated successfully with audit record' });
});

app.delete('/api/collections/:id', authenticateToken, async (req, res) => {
  const deleted = await db.deleteCollection(req.params.id, req.user.username);
  if (!deleted) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, message: '✅ Entry deleted successfully and audited' });
});

// 4. PRICING SETTINGS API
app.get('/api/settings/pricing', async (req, res) => {
  const rates = await db.getRates();
  res.json({ success: true, rates });
});

app.post('/api/settings/pricing', authenticateToken, async (req, res) => {
  const { cow_rate, buffalo_rate } = req.body;
  if (!cow_rate || !buffalo_rate || parseFloat(cow_rate) <= 0 || parseFloat(buffalo_rate) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid non-zero rates are required' });
  }
  const updatedRates = await db.updateRates(cow_rate, buffalo_rate, req.user.username);
  res.json({ success: true, rates: updatedRates, message: '✅ Milk prices updated successfully for future entries!' });
});

// 5. DASHBOARD & ANALYTICS API
app.get('/api/reports/dashboard', async (req, res) => {
  const collections = await db.getCollections();
  const customers = await db.getCustomers();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayCols = collections.filter(c => c.collection_date === todayStr);

  let todayCowL = 0, todayBufL = 0;
  let mCow = 0, mBuf = 0, eCow = 0, eBuf = 0;
  let todayCowAmt = 0, todayBufAmt = 0;

  todayCols.forEach(c => {
    if (c.milk_type === 'Cow') {
      todayCowL += c.quantity;
      todayCowAmt += c.total_amount;
    } else {
      todayBufL += c.quantity;
      todayBufAmt += c.total_amount;
    }

    if (c.shift === 'Morning') {
      if (c.milk_type === 'Cow') mCow += c.quantity;
      else mBuf += c.quantity;
    } else {
      if (c.milk_type === 'Cow') eCow += c.quantity;
      else eBuf += c.quantity;
    }
  });

  // Calculate past 7 days collection chart data
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayCols = collections.filter(c => c.collection_date === dStr);
    const cowL = dayCols.filter(c => c.milk_type === 'Cow').reduce((a, c) => a + c.quantity, 0);
    const bufL = dayCols.filter(c => c.milk_type === 'Buffalo').reduce((a, c) => a + c.quantity, 0);
    past7Days.push({
      date: dStr.substring(5), // MM-DD
      fullDate: dStr,
      Cow: parseFloat(cowL.toFixed(2)),
      Buffalo: parseFloat(bufL.toFixed(2)),
      Total: parseFloat((cowL + bufL).toFixed(2))
    });
  }

  // Top 10 Women suppliers
  const supplierMap = {};
  collections.forEach(c => {
    if (!supplierMap[c.customer_id]) {
      supplierMap[c.customer_id] = { id: c.customer_id, name: c.customer_name, totalLiters: 0, totalAmount: 0 };
    }
    supplierMap[c.customer_id].totalLiters += c.quantity;
    supplierMap[c.customer_id].totalAmount += c.total_amount;
  });

  const top10Suppliers = Object.values(supplierMap)
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 10)
    .map(s => ({ ...s, totalLiters: parseFloat(s.totalLiters.toFixed(2)) }));

  // Monthly collection summary
  const currentMonthStr = todayStr.substring(0, 7);
  const monthCols = collections.filter(c => c.collection_date.startsWith(currentMonthStr));
  const monthTotalCowL = monthCols.filter(c => c.milk_type === 'Cow').reduce((a, c) => a + c.quantity, 0);
  const monthTotalBufL = monthCols.filter(c => c.milk_type === 'Buffalo').reduce((a, c) => a + c.quantity, 0);
  const monthTotalRevenue = monthCols.reduce((a, c) => a + c.total_amount, 0);

  // Overall Cow vs Buffalo totals for Pie Chart
  const grandCowL = collections.filter(c => c.milk_type === 'Cow').reduce((a, c) => a + c.quantity, 0);
  const grandBufL = collections.filter(c => c.milk_type === 'Buffalo').reduce((a, c) => a + c.quantity, 0);

  res.json({
    success: true,
    today: {
      totalCowLiters: parseFloat(todayCowL.toFixed(2)),
      totalBufLiters: parseFloat(todayBufL.toFixed(2)),
      totalLiters: parseFloat((todayCowL + todayBufL).toFixed(2)),
      morning: { cow: mCow, buffalo: mBuf },
      evening: { cow: eCow, buffalo: eBuf },
      revenue: {
        cowAmount: todayCowAmt,
        bufAmount: todayBufAmt,
        totalAmount: todayCowAmt + todayBufAmt
      }
    },
    weekly: {
      totalLiters: past7Days.reduce((a, c) => a + c.Total, 0),
      chartData: past7Days
    },
    monthly: {
      monthName: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalCowLiters: parseFloat(monthTotalCowL.toFixed(2)),
      totalBufLiters: parseFloat(monthTotalBufL.toFixed(2)),
      grandTotalLiters: parseFloat((monthTotalCowL + monthTotalBufL).toFixed(2)),
      totalRevenue: monthTotalRevenue
    },
    counts: {
      registeredWomen: customers.length,
      totalEntries: collections.length
    },
    charts: {
      cowVsBuffaloPie: [
        { name: 'Cow Milk', value: parseFloat(grandCowL.toFixed(2)), color: '#eab308' },
        { name: 'Buffalo Milk', value: parseFloat(grandBufL.toFixed(2)), color: '#0284c7' }
      ],
      dailyCollection: past7Days,
      top10Suppliers
    }
  });
});

// 6. AUDIT TRAIL API
app.get('/api/reports/audit', async (req, res) => {
  const auditLogs = await db.getAuditLogs();
  res.json({ success: true, auditLogs });
});

// 7. SYSTEM RESET API
app.post('/api/admin/reset', async (req, res) => {
  await db.resetData();
  res.json({ success: true, message: '✅ All sample data wiped completely' });
});

app.listen(PORT, () => {
  console.log(`🥛 Milkman API Server running on port ${PORT}`);
});
