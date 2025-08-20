import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';
import bcrypt from 'bcryptjs';

const verboseSqlite3 = sqlite3.verbose();
const DB_NAME = "inventory_db.sqlite";
let db;

const TABLES = {
  "accounts": `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  "customers": `
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        contact_info VARCHAR(100),
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  "product_categories": `
    CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  "products": `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        size VARCHAR(50),
        color VARCHAR(50),
        price_per_unit_bought REAL NOT NULL,
        price_per_unit_sold REAL NOT NULL,
        quantity_bought INT NOT NULL,
        quantity_sold INT DEFAULT 0,
        weight REAL,
        weight_unit VARCHAR(10),
        total_price_bought REAL NOT NULL,
        image_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
    )
  `,
  "sales": `
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INT NOT NULL,
        total_price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `,
  "sales_items": `
    CREATE TABLE IF NOT EXISTS sales_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_per_unit REAL NOT NULL,
        discount_per_unit REAL DEFAULT 0,
        total_price REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `,
  "user_history": `
    CREATE TABLE IF NOT EXISTS user_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action VARCHAR(200) NOT NULL,
        linked_action_id INT,
        linked_action_table VARCHAR(50) NOT NULL,
        old_data TEXT,
        new_data TEXT,
        account_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `
};

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), DB_NAME);
    db = new verboseSqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database: ' + err.message);
        reject(err);
        return;
      }
      console.log('Database connected!');
      db.serialize(() => {
        // Create all tables
        for (const table in TABLES) {
          db.run(TABLES[table], (err) => {
            if (err) {
              console.error(`Error creating table ${table}:`, err.message);
            }
          });
        }

        // Check if an admin user exists, create one if not
        db.get(
          `SELECT id FROM accounts WHERE role = 'admin'`,
          [],
          (err, row) => {
            if (err) {
              console.error('Error checking for admin user:', err.message);
              reject(err);
              return;
            }
            if (!row) {
              const defaultUsername = 'admin';
              const defaultPassword = 'admin123'; // Default password
              const defaultRole = 'admin';
              const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

              db.run(
                `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
                [defaultUsername, hashedPassword, defaultRole],
                (err) => {
                  if (err) {
                    console.error('Error creating admin user:', err.message);
                    reject(err);
                    return;
                  }
                  console.log('Default admin user created: username=admin, password=admin123');
                  resolve(db);
                }
              );
            } else {
              console.log('Admin user already exists');
              resolve(db);
            }
          }
        );
      });
    });
  });
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase first.');
  }
  return db;
}

async function logUserAction({ action, linked_action_id, linked_action_table, old_data, new_data, account_id }) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      `INSERT INTO user_history (action, linked_action_id, linked_action_table, old_data, new_data, account_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        action,
        linked_action_id,
        linked_action_table,
        old_data ? old_data : null,
        new_data ? new_data : null,
        account_id
      ],
      (err) => {
        if (err) {
          console.error(`Error logging user action: ${err.message}`);
          reject(err);
          return;
        }
        console.log(`Logged action: ${action} on table ${linked_action_table} by account ${account_id}`);
        resolve();
      }
    );
  });
}

export { setupDatabase, getDb, logUserAction };