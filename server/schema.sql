-- Milk Collection Management System Database Schema
-- Compatible with MySQL 8.0+, PostgreSQL 12+, and SQLite3

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'milkman', -- 'admin', 'milkman'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS / WOMEN FARMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(20) PRIMARY KEY, -- e.g. M0001
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    qr_code VARCHAR(100), -- Future expansion: QR identifier
    collection_center_id VARCHAR(50) DEFAULT 'CENTER_01', -- Future expansion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRICING SETTINGS (Historical rate tracking)
CREATE TABLE IF NOT EXISTS price_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cow_rate DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
    buffalo_rate DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
);

-- 4. MILK COLLECTIONS
CREATE TABLE IF NOT EXISTS milk_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    collection_time VARCHAR(20) NOT NULL,
    shift VARCHAR(10) NOT NULL, -- 'Morning', 'Evening'
    milk_type VARCHAR(10) NOT NULL, -- 'Cow', 'Buffalo'
    quantity DECIMAL(10, 2) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    milkman_id INT DEFAULT 1, -- Future expansion: multi-milkman
    center_id VARCHAR(50) DEFAULT 'CENTER_01', -- Future expansion: multi-center
    gps_lat DECIMAL(10, 8) NULL, -- Future expansion: GPS location
    gps_lng DECIMAL(11, 8) NULL, -- Future expansion: GPS location
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- Future expansion: 'PAID', 'PENDING', 'UPI'
    upi_ref VARCHAR(50) NULL, -- Future expansion: UPI transaction ID
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. AUDIT LOGS / HISTORY
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT,
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_data TEXT, -- JSON string of old record
    new_data TEXT, -- JSON string of new record
    modified_by VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST SEARCH & FILTERING
CREATE INDEX IF NOT EXISTS idx_collections_date ON milk_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_collections_customer ON milk_collections(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
