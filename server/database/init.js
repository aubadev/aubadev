const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'shop.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table - minimal data only
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          stock INTEGER DEFAULT 0,
          category TEXT,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table - will be auto-deleted after shipping
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          user_id INTEGER,
          total_amount DECIMAL(10,2) NOT NULL,
          cryptocurrency TEXT NOT NULL,
          payment_address TEXT,
          payment_status TEXT DEFAULT 'pending',
          shipping_status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          shipped_at DATETIME,
          auto_delete_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Sessions table for JWT blacklist (temporary)
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_hash TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add some demo products
      db.run(`
        INSERT OR IGNORE INTO products (id, name, description, price, image_url, stock, category) VALUES
        (1, 'Digital Privacy Guide', 'Complete guide to online privacy and security', 29.99, '/images/privacy-guide.jpg', 100, 'Digital'),
        (2, 'Crypto Hardware Wallet', 'Secure hardware wallet for cryptocurrency storage', 99.99, '/images/hw-wallet.jpg', 50, 'Hardware'),
        (3, 'VPN Service (1 Year)', 'Anonymous VPN service subscription', 59.99, '/images/vpn-service.jpg', 1000, 'Service'),
        (4, 'Encrypted USB Drive', 'Hardware encrypted USB storage device', 79.99, '/images/usb-drive.jpg', 25, 'Hardware'),
        (5, 'Anonymous Email Service', 'Secure anonymous email service (1 year)', 39.99, '/images/email-service.jpg', 500, 'Service')
      `, (err) => {
        if (err) {
          console.error('Error inserting demo products:', err);
          reject(err);
        } else {
          console.log('✓ Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

const closeDatabase = () => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      resolve();
    });
  });
};

module.exports = { db, initDatabase, closeDatabase };