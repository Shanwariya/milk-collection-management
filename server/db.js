import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = process.env.DB_PATH || path.join(DATA_DIR, 'db.json');

const targetDir = path.dirname(DB_FILE);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Initial Empty Data Seeding for JSON mode
const seedInitialData = () => ({
  users: [
    { id: 1, username: 'milkman', password: 'milk123', full_name: 'Ramesh Milkman', role: 'milkman' },
    { id: 2, username: 'admin', password: 'admin123', full_name: 'Dairy Admin', role: 'admin' }
  ],
  customers: [],
  rates: { cow_rate: 20.00, buffalo_rate: 30.00, updated_at: new Date().toISOString() },
  collections: [],
  auditLogs: [],
  nextCustomerIdSeq: 1
});

class DBManager {
  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    this.isPg = !!process.env.DATABASE_URL;

    if (isProd && !this.isPg) {
      console.error('❌ FATAL ERROR: DATABASE_URL environment variable is missing!');
      console.error('❌ Production deployment REQUIRES a PostgreSQL DATABASE_URL. db.json is not allowed in production.');
      throw new Error('DATABASE_URL environment variable is required in production mode (NODE_ENV=production). Please configure a PostgreSQL database.');
    }

    if (this.isPg) {
      console.log('🐘 Connecting to Production PostgreSQL database...');
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
      });

      this.pool.on('error', (err) => {
        console.error('❌ Unexpected PostgreSQL Pool Error:', err);
      });

      this.initPgSchema();
    } else {
      console.log('📁 Using local persistent file database (db.json) for development mode');
      this.initJsonDb();
    }
  }

  initJsonDb() {
    if (!fs.existsSync(DB_FILE)) {
      this.data = seedInitialData();
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        const legacyNames = ['lakshmi', 'lakshmipriya', 'lakshana', 'sita devi', 'radha rani', 'anita sharma'];
        if (this.data.customers && this.data.customers.some(c => c.name && legacyNames.includes(c.name.toLowerCase()))) {
          this.data = seedInitialData();
          this.save();
        }
      } catch (err) {
        this.data = seedInitialData();
        this.save();
      }
    }
  }

  async initPgSchema() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'milkman',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(20) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          address TEXT,
          notes TEXT,
          role VARCHAR(20) DEFAULT 'customer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rates (
          id SERIAL PRIMARY KEY,
          cow_rate NUMERIC(10,2) DEFAULT 20.00,
          buffalo_rate NUMERIC(10,2) DEFAULT 30.00,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_by VARCHAR(50) DEFAULT 'admin'
        );

        CREATE TABLE IF NOT EXISTS collections (
          id SERIAL PRIMARY KEY,
          customer_id VARCHAR(20) REFERENCES customers(id) ON DELETE CASCADE,
          customer_name VARCHAR(100) NOT NULL,
          collection_date DATE NOT NULL,
          collection_time VARCHAR(20) NOT NULL,
          shift VARCHAR(20) DEFAULT 'Morning',
          milk_type VARCHAR(20) DEFAULT 'Cow',
          quantity NUMERIC(10,2) NOT NULL,
          rate NUMERIC(10,2) NOT NULL,
          total_amount NUMERIC(10,2) NOT NULL,
          recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          collection_id INT,
          action VARCHAR(20) NOT NULL,
          old_data TEXT,
          new_data TEXT,
          modified_by VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed Milkman & Admin users if empty
      const userRes = await this.pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userRes.rows[0].count) === 0) {
        await this.pool.query(`
          INSERT INTO users (username, password, full_name, role) VALUES 
          ('milkman', 'milk123', 'Ramesh Milkman', 'milkman'),
          ('admin', 'admin123', 'Dairy Admin', 'admin');
        `);
      }

      // Seed initial rate if empty
      const rateRes = await this.pool.query('SELECT COUNT(*) FROM rates');
      if (parseInt(rateRes.rows[0].count) === 0) {
        await this.pool.query(`
          INSERT INTO rates (cow_rate, buffalo_rate, updated_by) VALUES (20.00, 30.00, 'admin');
        `);
      }

      console.log('✅ PostgreSQL Schema Initialized Successfully');
    } catch (err) {
      console.error('❌ Error initializing PostgreSQL Schema:', err);
    }
  }

  save() {
    if (!this.isPg) {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    }
  }

  async resetData() {
    if (this.isPg) {
      await this.pool.query('TRUNCATE collections, audit_logs, customers RESTART IDENTITY CASCADE');
    } else {
      this.data.customers = [];
      this.data.collections = [];
      this.data.auditLogs = [];
      this.data.nextCustomerIdSeq = 1;
      this.save();
    }
  }

  async generateCustomerId() {
    if (this.isPg) {
      const res = await this.pool.query('SELECT COUNT(*) FROM customers');
      const seq = parseInt(res.rows[0].count) + 1;
      return 'M' + String(seq).padStart(4, '0');
    } else {
      const seq = this.data.nextCustomerIdSeq || (this.data.customers.length + 1);
      this.data.nextCustomerIdSeq = seq + 1;
      const formatted = 'M' + String(seq).padStart(4, '0');
      this.save();
      return formatted;
    }
  }

  async authenticateUser(username, password) {
    const uName = (username || '').trim().toLowerCase();
    const pWord = (password || '').trim();

    const verifyPassword = (inputPass, storedPass) => {
      if (!inputPass || !storedPass) return false;
      const trimmedInput = inputPass.trim();
      const trimmedStored = storedPass.trim();
      if (trimmedInput === trimmedStored || inputPass === storedPass) return true;
      try {
        return bcrypt.compareSync(trimmedInput, storedPass) || bcrypt.compareSync(inputPass, storedPass);
      } catch (e) {
        return false;
      }
    };

    if (this.isPg) {
      // 1. Check users table
      const userRes = await this.pool.query('SELECT * FROM users WHERE LOWER(username) = $1', [uName]);
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        if (verifyPassword(password, u.password)) {
          return {
            id: u.id,
            username: u.username,
            full_name: u.full_name,
            role: u.role,
            customer_id: u.role === 'customer' ? (u.customer_id || u.username) : null
          };
        }
      }

      // 2. Check customers table
      const custRes = await this.pool.query('SELECT * FROM customers WHERE LOWER(username) = $1', [uName]);
      if (custRes.rows.length > 0) {
        const c = custRes.rows[0];
        if (verifyPassword(password, c.password)) {
          return {
            id: c.id,
            username: c.username,
            full_name: c.name,
            role: 'customer',
            customer_id: c.id
          };
        }
      }

      console.warn(`[AUTH FAIL] Login failed for username "${uName}"`);
      return null;
    } else {
      const u = (this.data.users || []).find(user => 
        user.username.toLowerCase() === uName && verifyPassword(password, user.password)
      );
      if (u) return u;

      const cust = (this.data.customers || []).find(c => 
        c.username && c.username.toLowerCase() === uName && verifyPassword(password, c.password)
      );
      if (cust) {
        return {
          id: cust.id,
          username: cust.username,
          full_name: cust.name,
          role: 'customer',
          customer_id: cust.id
        };
      }
      return null;
    }
  }

  async registerCustomer({ username, password, name, phone, address, notes }) {
    const uName = (username || '').trim().toLowerCase();
    const pWord = (password || '').trim();

    if (this.isPg) {
      const existingUser = await this.pool.query('SELECT username FROM users WHERE LOWER(username) = $1 UNION SELECT username FROM customers WHERE LOWER(username) = $1', [uName]);
      if (existingUser.rows.length > 0) {
        return { error: 'Username is already taken. Please try logging in or use another username.' };
      }

      const id = await this.generateCustomerId();
      const insertRes = await this.pool.query(
        'INSERT INTO customers (id, username, password, name, phone, address, notes, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, uName, pWord, name.trim(), phone || '', address || '', notes || '', 'customer']
      );

      // Dual-table sync: insert into users table as well
      await this.pool.query(
        'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
        [uName, pWord, name.trim(), 'customer']
      );

      return { customer: insertRes.rows[0] };
    } else {
      const existingUser = (this.data.users || []).find(u => u.username.toLowerCase() === uName) ||
                           (this.data.customers || []).find(c => c.username && c.username.toLowerCase() === uName);
      if (existingUser) {
        return { error: 'Username is already taken. Please try logging in or use another username.' };
      }

      const id = await this.generateCustomerId();
      const newCust = {
        id,
        username: uName,
        password: pWord,
        name: name.trim(),
        phone: phone || '',
        address: address || '',
        notes: notes || '',
        role: 'customer',
        created_at: new Date().toISOString()
      };

      this.data.customers.unshift(newCust);
      this.save();
      return { customer: newCust };
    }
  }

  async getCustomers() {
    if (this.isPg) {
      const res = await this.pool.query('SELECT * FROM customers ORDER BY created_at DESC');
      return res.rows;
    }
    return this.data.customers;
  }

  async getCustomerById(id) {
    if (this.isPg) {
      const res = await this.pool.query('SELECT * FROM customers WHERE LOWER(id) = $1 OR LOWER(username) = $1', [id.toLowerCase()]);
      return res.rows[0] || null;
    }
    return this.data.customers.find(c => 
      c.id.toLowerCase() === id.toLowerCase() || 
      (c.username && c.username.toLowerCase() === id.toLowerCase())
    );
  }

  async addCustomer(customerData) {
    if (this.isPg) {
      const id = customerData.id || await this.generateCustomerId();
      const uName = customerData.username || customerData.name.toLowerCase().replace(/\s+/g, '');
      const res = await this.pool.query(
        'INSERT INTO customers (id, username, password, name, phone, address, notes, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, uName, customerData.password || '123456', customerData.name, customerData.phone || '', customerData.address || '', customerData.notes || '', 'customer']
      );
      return res.rows[0];
    }
    const id = customerData.id || await this.generateCustomerId();
    const newCustomer = {
      id,
      username: customerData.username || customerData.name.toLowerCase().replace(/\s+/g, ''),
      password: customerData.password || '123456',
      name: customerData.name,
      phone: customerData.phone || '',
      address: customerData.address || '',
      notes: customerData.notes || '',
      role: 'customer',
      created_at: new Date().toISOString()
    };
    this.data.customers.unshift(newCustomer);
    this.save();
    return newCustomer;
  }

  async deleteCustomer(id) {
    if (this.isPg) {
      const res = await this.pool.query('DELETE FROM customers WHERE LOWER(id) = $1 OR LOWER(username) = $1 RETURNING id', [id.toLowerCase()]);
      return res.rows.length > 0;
    }
    const index = this.data.customers.findIndex(c => 
      c.id.toLowerCase() === id.toLowerCase() || 
      (c.username && c.username.toLowerCase() === id.toLowerCase())
    );
    if (index === -1) return false;

    const removed = this.data.customers[index];
    this.data.customers.splice(index, 1);
    this.data.collections = this.data.collections.filter(col => 
      col.customer_id.toLowerCase() !== removed.id.toLowerCase()
    );
    this.save();
    return true;
  }

  async getRates() {
    if (this.isPg) {
      const res = await this.pool.query('SELECT cow_rate, buffalo_rate, updated_at FROM rates ORDER BY id DESC LIMIT 1');
      if (res.rows.length > 0) {
        return {
          cow_rate: parseFloat(res.rows[0].cow_rate),
          buffalo_rate: parseFloat(res.rows[0].buffalo_rate),
          updated_at: res.rows[0].updated_at
        };
      }
      return { cow_rate: 20.00, buffalo_rate: 30.00 };
    }
    return this.data.rates || { cow_rate: 20.00, buffalo_rate: 30.00 };
  }

  async updateRates(cow_rate, buffalo_rate, updated_by = 'admin') {
    if (this.isPg) {
      const res = await this.pool.query(
        'INSERT INTO rates (cow_rate, buffalo_rate, updated_by) VALUES ($1, $2, $3) RETURNING cow_rate, buffalo_rate, updated_at',
        [parseFloat(cow_rate), parseFloat(buffalo_rate), updated_by]
      );
      return {
        cow_rate: parseFloat(res.rows[0].cow_rate),
        buffalo_rate: parseFloat(res.rows[0].buffalo_rate),
        updated_at: res.rows[0].updated_at
      };
    }
    this.data.rates = {
      cow_rate: parseFloat(cow_rate),
      buffalo_rate: parseFloat(buffalo_rate),
      updated_at: new Date().toISOString(),
      updated_by
    };
    this.save();
    return this.data.rates;
  }

  async getCollections() {
    if (this.isPg) {
      const res = await this.pool.query('SELECT id, customer_id, customer_name, to_char(collection_date, \'YYYY-MM-DD\') as collection_date, collection_time, shift, milk_type, quantity::float, rate::float, total_amount::float, recorded_at FROM collections ORDER BY id DESC');
      return res.rows;
    }
    return this.data.collections;
  }

  async addCollection(data, user = 'milkman') {
    const rates = await this.getRates();
    const rate = data.milk_type === 'Cow' ? rates.cow_rate : rates.buffalo_rate;
    const qty = parseFloat(data.quantity);
    const total_amount = parseFloat((qty * rate).toFixed(2));
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = data.collection_date || now.toISOString().split('T')[0];

    if (this.isPg) {
      const res = await this.pool.query(
        `INSERT INTO collections (customer_id, customer_name, collection_date, collection_time, shift, milk_type, quantity, rate, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, customer_id, customer_name, to_char(collection_date, 'YYYY-MM-DD') as collection_date, collection_time, shift, milk_type, quantity::float, rate::float, total_amount::float, recorded_at`,
        [data.customer_id, data.customer_name, dateStr, data.collection_time || timeStr, data.shift || 'Morning', data.milk_type || 'Cow', qty, parseFloat(data.rate || rate), total_amount]
      );
      return res.rows[0];
    }

    const newRecord = {
      id: this.data.collections.length ? Math.max(...this.data.collections.map(c => c.id)) + 1 : 1,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      collection_date: dateStr,
      collection_time: data.collection_time || timeStr,
      shift: data.shift || 'Morning',
      milk_type: data.milk_type || 'Cow',
      quantity: qty,
      rate: parseFloat(data.rate || rate),
      total_amount,
      recorded_at: now.toISOString()
    };
    this.data.collections.unshift(newRecord);
    this.save();
    return newRecord;
  }

  async updateCollection(id, updateData, user = 'admin') {
    const qty = parseFloat(updateData.quantity);
    const rate = parseFloat(updateData.rate || 20);
    const total_amount = parseFloat((qty * rate).toFixed(2));

    if (this.isPg) {
      const res = await this.pool.query(
        `UPDATE collections SET shift = $1, milk_type = $2, quantity = $3, rate = $4, total_amount = $5 WHERE id = $6
         RETURNING id, customer_id, customer_name, to_char(collection_date, 'YYYY-MM-DD') as collection_date, collection_time, shift, milk_type, quantity::float, rate::float, total_amount::float, recorded_at`,
        [updateData.shift, updateData.milk_type, qty, rate, total_amount, parseInt(id)]
      );
      return res.rows[0] || null;
    }

    const idx = this.data.collections.findIndex(c => c.id === parseInt(id));
    if (idx === -1) return null;
    const oldRecord = { ...this.data.collections[idx] };
    const updatedRecord = {
      ...oldRecord,
      shift: updateData.shift || oldRecord.shift,
      milk_type: updateData.milk_type || oldRecord.milk_type,
      quantity: qty,
      rate,
      total_amount,
      updated_at: new Date().toISOString()
    };
    this.data.collections[idx] = updatedRecord;
    this.save();
    return updatedRecord;
  }

  async deleteCollection(id, user = 'admin') {
    if (this.isPg) {
      const res = await this.pool.query('DELETE FROM collections WHERE id = $1 RETURNING id', [parseInt(id)]);
      return res.rows.length > 0;
    }
    const idx = this.data.collections.findIndex(c => c.id === parseInt(id));
    if (idx === -1) return false;
    this.data.collections.splice(idx, 1);
    this.save();
    return true;
  }

  async getAuditLogs() {
    if (this.isPg) {
      const res = await this.pool.query('SELECT * FROM audit_logs ORDER BY id DESC');
      return res.rows;
    }
    return this.data.auditLogs;
  }
}

export const db = new DBManager();
