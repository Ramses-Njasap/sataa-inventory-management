import { ipcMain, app, dialog, BrowserWindow } from 'electron';
import { getDb, logUserAction } from '../database';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';

const verboseSqlite3 = sqlite3.verbose();
const AUTH_FILE = path.join(app.getPath('userData'), 'auth.json');
const dbPath = path.join(app.getPath('userData'), 'inventory_db.sqlite');
const db = new verboseSqlite3.Database(dbPath);

// ==================== AUTHENTICATION HANDLERS ====================
ipcMain.handle('login', async (event, { username, password, role }) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM accounts WHERE username = ? AND role = ?`,
      [username, role],
      async (err, row) => {
        if (err) {
          reject(err.message);
          return;
        }
        if (!row) {
          reject('Invalid username or role');
          return;
        }
        const match = await bcrypt.compare(password, row.password_hash);
        if (match) {
          const userData = { id: row.id, username, role };
          try {
            const userDataDir = path.dirname(AUTH_FILE);
            await fs.mkdir(userDataDir, { recursive: true });
            await fs.writeFile(AUTH_FILE, JSON.stringify(userData, null, 2));
            // Log login action
            await logUserAction({
              action: 'logged in',
              linked_action_id: row.id,
              linked_action_table: 'accounts',
              old_data: null,
              new_data: null,
              account_id: row.id
            });
            resolve(userData);
          } catch (error) {
            reject('Failed to save auth data: ' + error.message);
          }
        } else {
          reject('Invalid password');
        }
      }
    );
  });
});

ipcMain.handle('get-user-role', async () => {
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    return userData.role;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('logout', async () => {
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    await fs.unlink(AUTH_FILE).catch((err) => {
      if (err.code !== 'ENOENT') throw err;
    });
    // Log logout action
    await logUserAction({
      action: 'logged out',
      linked_action_id: currentUserId,
      linked_action_table: 'accounts',
      old_data: null,
      new_data: null,
      account_id: currentUserId
    });
    return true;
  } catch (error) {
    throw new Error('Failed to logout: ' + error.message);
  }
});

ipcMain.handle('get-auth-status', async () => {
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    return !!userData;
  } catch (error) {
    return false;
  }
});

// ==================== ACCOUNT MANAGEMENT ====================
ipcMain.handle('add-account', async (event, account) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const hashedPassword = bcrypt.hashSync(account.password, 10);
      db.run(
        `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
        [account.username, hashedPassword, account.role],
        async function (err) {
          if (err) {
            reject(err.message);
          } else {
            await logUserAction({
              action: 'added a new account',
              linked_action_id: this.lastID,
              linked_action_table: 'accounts',
              old_data: null,
              new_data: JSON.stringify({
                username: account.username,
                role: account.role
              }),
              account_id: currentUserId
            });
            resolve({ id: this.lastID, ...account });
          }
        }
      );
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('get-accounts', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM accounts ORDER BY username ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('update-account', async (event, account) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const oldAccount = await new Promise((resolve, reject) => {
        db.get('SELECT username, role FROM accounts WHERE id = ?', [account.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldAccount) {
        reject('Account not found');
        return;
      }

      let query, params;
      if (account.password) {
        const hashedPassword = bcrypt.hashSync(account.password, 10);
        query = 'UPDATE accounts SET username = ?, password_hash = ?, role = ? WHERE id = ?';
        params = [account.username, hashedPassword, account.role, account.id];
      } else {
        query = 'UPDATE accounts SET username = ?, role = ? WHERE id = ?';
        params = [account.username, account.role, account.id];
      }

      db.run(query, params, async function (err) {
        if (err) {
          reject(err.message);
        } else {
          await logUserAction({
            action: 'updated account',
            linked_action_id: account.id,
            linked_action_table: 'accounts',
            old_data: JSON.stringify({
              username: oldAccount.username,
              role: oldAccount.role
            }),
            new_data: JSON.stringify({
              username: account.username,
              role: account.role
            }),
            account_id: currentUserId
          });
          resolve(this.changes);
        }
      });
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-account', async (event, id) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      db.run('DELETE FROM accounts WHERE id = ?', [id], async function (err) {
        if (err) {
          reject(err.message);
        } else {
          await logUserAction({
            action: 'deleted an account',
            linked_action_id: null,
            linked_action_table: 'accounts',
            old_data: null,
            new_data: null,
            account_id: currentUserId
          });
          resolve(this.changes);
        }
      });
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

// ==================== CUSTOMER MANAGEMENT ====================
ipcMain.handle('add-customer', async (event, customer) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      db.run(
        `INSERT INTO customers (name, contact_info, address) VALUES (?, ?, ?)`,
        [customer.name, customer.contact_info, customer.address],
        async function (err) {
          if (err) {
            reject(err.message);
          } else {
            await logUserAction({
              action: 'added a new customer',
              linked_action_id: this.lastID,
              linked_action_table: 'customers',
              old_data: null,
              new_data: JSON.stringify({
                name: customer.name,
                contact_info: customer.contact_info,
                address: customer.address
              }),
              account_id: currentUserId
            });
            resolve({ id: this.lastID, ...customer });
          }
        }
      );
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('get-customers', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM customers ORDER BY name ASC`, [], (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('update-customer', async (event, customer) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const oldCustomer = await new Promise((resolve, reject) => {
        db.get('SELECT name, contact_info, address FROM customers WHERE id = ?', [customer.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldCustomer) {
        reject('Customer not found');
        return;
      }

      db.run(
        `UPDATE customers SET name = ?, contact_info = ?, address = ? WHERE id = ?`,
        [customer.name, customer.contact_info, customer.address, customer.id],
        async function (err) {
          if (err) {
            reject(err.message);
          } else {
            await logUserAction({
              action: 'updated customer',
              linked_action_id: customer.id,
              linked_action_table: 'customers',
              old_data: JSON.stringify({
                name: oldCustomer.name,
                contact_info: oldCustomer.contact_info,
                address: oldCustomer.address
              }),
              new_data: JSON.stringify({
                name: customer.name,
                contact_info: customer.contact_info,
                address: customer.address
              }),
              account_id: currentUserId
            });
            resolve(this.changes);
          }
        }
      );
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-customer', async (event, id) => {
  const db = getDb();

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const sales = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM sales WHERE customer_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (sales.length > 0) {
      throw new Error('Cannot delete customer with associated sales');
    }

    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM customers WHERE id = ?`, [id], async function (err) {
        if (err) {
          reject(err.message);
        } else {
          await logUserAction({
            action: 'deleted a customer',
            linked_action_id: null,
            linked_action_table: 'customers',
            old_data: null,
            new_data: null,
            account_id: currentUserId
          });
          resolve(this.changes);
        }
      });
    });
  } catch (error) {
    throw new Error('Failed to delete customer: ' + error.message);
  }
});

// ==================== PRODUCT CATEGORY MANAGEMENT ====================
ipcMain.handle('get-product-categories', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_categories ORDER BY name ASC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
});

ipcMain.handle('add-product-category', async (event, category) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const stmt = db.prepare('INSERT INTO product_categories (name, description, image_path) VALUES (?, ?, ?)');
      const result = stmt.run(category.name, category.description || null, category.image_path || null);
      await logUserAction({
        action: 'added a new product category',
        linked_action_id: result.lastInsertRowid,
        linked_action_table: 'product_categories',
        old_data: null,
        new_data: JSON.stringify({
          name: category.name,
          description: category.description || null,
          image_path: category.image_path || null
        }),
        account_id: currentUserId
      });
      resolve(result.lastInsertRowid);
    } catch (error) {
      reject('Failed to add product category: ' + error.message);
    }
  });
});

ipcMain.handle('update-product-category', async (event, category) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const oldCategory = await new Promise((resolve, reject) => {
        db.get('SELECT name, description, image_path FROM product_categories WHERE id = ?', [category.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldCategory) {
        reject('Product category not found');
        return;
      }

      const stmt = db.prepare(`
        UPDATE product_categories
        SET name = ?, description = ?, image_path = ?
        WHERE id = ?
      `);
      const result = stmt.run(
        category.name,
        category.description || null,
        category.image_path || null,
        category.id
      );
      await logUserAction({
        action: 'updated product category',
        linked_action_id: category.id,
        linked_action_table: 'product_categories',
        old_data: JSON.stringify({
          name: oldCategory.name,
          description: oldCategory.description,
          image_path: oldCategory.image_path
        }),
        new_data: JSON.stringify({
          name: category.name,
          description: category.description || null,
          image_path: category.image_path || null
        }),
        account_id: currentUserId
      });
      resolve(result.changes);
    } catch (error) {
      reject('Failed to update product category: ' + error.message);
    }
  });
});

ipcMain.handle('delete-product-category', async (event, id) => {
  const db = getDb();

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const products = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM products WHERE category_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (products.length > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    const stmt = db.prepare('DELETE FROM product_categories WHERE id = ?');
    const result = stmt.run(id);
    await logUserAction({
      action: 'deleted a product category',
      linked_action_id: null,
      linked_action_table: 'product_categories',
      old_data: null,
      new_data: null,
      account_id: currentUserId
    });
    return result.changes;
  } catch (error) {
    throw new Error('Failed to delete product category: ' + error.message);
  }
});

// ==================== PRODUCT MANAGEMENT ====================
ipcMain.handle('get-products', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY name ASC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-product-by-id', async (event, id) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error('Product not found'));
      } else {
        resolve(row);
      }
    });
  });
});

ipcMain.handle('add-product', async (event, product) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const stmt = db.prepare(`
        INSERT INTO products (category_id, name, size, color, price_per_unit_bought, price_per_unit_sold,
                             quantity_bought, quantity_sold, weight, weight_unit, total_price_bought, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        product.category_id,
        product.name,
        product.size || null,
        product.color || null,
        product.price_per_unit_bought,
        product.price_per_unit_sold,
        product.quantity_bought,
        product.quantity_sold || 0,
        product.weight || null,
        product.weight_unit || null,
        product.total_price_bought,
        product.image_path || null
      );
      await logUserAction({
        action: 'added a new product',
        linked_action_id: result.lastInsertRowid,
        linked_action_table: 'products',
        old_data: null,
        new_data: JSON.stringify({
          category_id: product.category_id,
          name: product.name,
          size: product.size || null,
          color: product.color || null,
          price_per_unit_bought: product.price_per_unit_bought,
          price_per_unit_sold: product.price_per_unit_sold,
          quantity_bought: product.quantity_bought,
          quantity_sold: product.quantity_sold || 0,
          weight: product.weight || null,
          weight_unit: product.weight_unit || null,
          total_price_bought: product.total_price_bought,
          image_path: product.image_path || null
        }),
        account_id: currentUserId
      });
      resolve(result.lastInsertRowid);
    } catch (error) {
      reject('Failed to add product: ' + error.message);
    }
  });
});

ipcMain.handle('update-product', async (event, product) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const oldProduct = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [product.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldProduct) {
        reject('Product not found');
        return;
      }

      const stmt = db.prepare(`
        UPDATE products
        SET name = ?, category_id = ?, size = ?, color = ?, price_per_unit_bought = ?,
            price_per_unit_sold = ?, quantity_bought = ?, quantity_sold = ?,
            weight = ?, weight_unit = ?, total_price_bought = ?, image_path = ?
        WHERE id = ?
      `);
      const result = stmt.run(
        product.name,
        product.category_id,
        product.size || null,
        product.color || null,
        product.price_per_unit_bought,
        product.price_per_unit_sold,
        product.quantity_bought,
        product.quantity_sold,
        product.weight || null,
        product.weight_unit || null,
        product.total_price_bought,
        product.image_path || null,
        product.id
      );
      await logUserAction({
        action: 'updated product',
        linked_action_id: product.id,
        linked_action_table: 'products',
        old_data: JSON.stringify({
          name: oldProduct.name,
          category_id: oldProduct.category_id,
          size: oldProduct.size,
          color: oldProduct.color,
          price_per_unit_bought: oldProduct.price_per_unit_bought,
          price_per_unit_sold: oldProduct.price_per_unit_sold,
          quantity_bought: oldProduct.quantity_bought,
          quantity_sold: oldProduct.quantity_sold,
          weight: oldProduct.weight,
          weight_unit: oldProduct.weight_unit,
          total_price_bought: oldProduct.total_price_bought,
          image_path: oldProduct.image_path
        }),
        new_data: JSON.stringify({
          name: product.name,
          category_id: product.category_id,
          size: product.size || null,
          color: product.color || null,
          price_per_unit_bought: product.price_per_unit_bought,
          price_per_unit_sold: product.price_per_unit_sold,
          quantity_bought: product.quantity_bought,
          quantity_sold: product.quantity_sold,
          weight: product.weight || null,
          weight_unit: product.weight_unit || null,
          total_price_bought: product.total_price_bought,
          image_path: product.image_path || null
        }),
        account_id: currentUserId
      });
      resolve(result.changes);
    } catch (error) {
      reject('Failed to update product: ' + error.message);
    }
  });
});

ipcMain.handle('delete-product', async (event, id) => {
  const db = getDb();

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const saleItems = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM sales_items WHERE product_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (saleItems.length > 0) {
      throw new Error('Cannot delete product with associated sales');
    }

    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [id], async function (err) {
        if (err) {
          reject(err.message);
        } else {
          await logUserAction({
            action: 'deleted a product',
            linked_action_id: null,
            linked_action_table: 'products',
            old_data: null,
            new_data: null,
            account_id: currentUserId
          });
          resolve(this.changes);
        }
      });
    });
  } catch (error) {
    reject('Failed to delete product: ' + error.message);
  }
});

// ==================== SALES MANAGEMENT ====================
ipcMain.handle('add-sale', async (event, saleData) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      db.run(
        `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
        [saleData.customer_id, saleData.total_price],
        async function (err) {
          if (err) {
            reject(err.message);
          } else {
            await logUserAction({
              action: 'added a new sale',
              linked_action_id: this.lastID,
              linked_action_table: 'sales',
              old_data: null,
              new_data: JSON.stringify({
                customer_id: saleData.customer_id,
                total_price: saleData.total_price
              }),
              account_id: currentUserId
            });
            resolve({ id: this.lastID });
          }
        }
      );
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('get-sales-by-customer', async (event, customerId) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        s.id,
        s.total_price,
        s.created_at,
        (
          SELECT json_group_array(
            json_object(
              'product_id', si.product_id,
              'product_name', p.name,
              'quantity', si.quantity,
              'price_per_unit', si.price_per_unit,
              'total_price', si.total_price
            )
          )
          FROM sales_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = s.id
        ) as items
      FROM sales s
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC
    `, [customerId], (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        const sales = rows.map(row => ({
          ...row,
          items: row.items ? JSON.parse(row.items) : []
        }));
        resolve(sales);
      }
    });
  });
});

ipcMain.handle('create-sale', async (event, saleData) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const saleResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
        [saleData.customerId, saleData.items.reduce((sum, item) => sum + item.total_price, 0)],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    for (const item of saleData.items) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
           VALUES (?, ?, ?, ?, ?)`,
          [saleResult, item.product_id, item.quantity, item.price, item.total_price],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
          [item.quantity, item.product_id],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    await logUserAction({
      action: 'created a sale',
      linked_action_id: saleResult,
      linked_action_table: 'sales',
      old_data: null,
      new_data: JSON.stringify({
        customer_id: saleData.customerId,
        total_price: saleData.items.reduce((sum, item) => sum + item.total_price, 0),
        items: saleData.items
      }),
      account_id: currentUserId
    });

    db.run("COMMIT");
    return { id: saleResult };
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
});

ipcMain.handle('get-sales', async () => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT s.*, c.name as customer_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-sale-by-id', async (event, id) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT s.*, c.name as customer_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id], (err, row) => {
      if (err) {
        reject(err.message);
      } else if (!row) {
        reject(new Error('Sale not found'));
      } else {
        resolve(row);
      }
    });
  });
});

ipcMain.handle('update-sale', async (event, sale) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;

      const oldSale = await new Promise((resolve, reject) => {
        db.get('SELECT customer_id, total_price FROM sales WHERE id = ?', [sale.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldSale) {
        reject('Sale not found');
        return;
      }

      db.run(
        `UPDATE sales SET customer_id = ?, total_price = ? WHERE id = ?`,
        [sale.customer_id, sale.total_price, sale.id],
        async function (err) {
          if (err) {
            reject(err.message);
          } else {
            await logUserAction({
              action: 'updated sale',
              linked_action_id: sale.id,
              linked_action_table: 'sales',
              old_data: JSON.stringify({
                customer_id: oldSale.customer_id,
                total_price: oldSale.total_price
              }),
              new_data: JSON.stringify({
                customer_id: sale.customer_id,
                total_price: sale.total_price
              }),
              account_id: currentUserId
            });
            resolve(this.changes);
          }
        }
      );
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-sale', async (event, id) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM sales_items WHERE sale_id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM sales WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    await logUserAction({
      action: 'deleted a sale',
      linked_action_id: null,
      linked_action_table: 'sales',
      old_data: null,
      new_data: null,
      account_id: currentUserId
    });

    db.run("COMMIT");
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    throw new Error('Failed to delete sale: ' + err.message);
  }
});

// ==================== SALE ITEMS MANAGEMENT ====================
ipcMain.handle('add-sale-item', async (event, saleItem) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          saleItem.sale_id,
          saleItem.product_id,
          saleItem.quantity,
          saleItem.price_per_unit,
          saleItem.total_price
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
        [saleItem.quantity, saleItem.product_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await logUserAction({
      action: 'added a new sale item',
      linked_action_id: saleItem.sale_id,
      linked_action_table: 'sales_items',
      old_data: null,
      new_data: JSON.stringify({
        sale_id: saleItem.sale_id,
        product_id: saleItem.product_id,
        quantity: saleItem.quantity,
        price_per_unit: saleItem.price_per_unit,
        total_price: saleItem.total_price
      }),
      account_id: currentUserId
    });

    db.run("COMMIT");
    return true;
  } catch (err) {
    db.run("ROLLBACK");
    throw new Error('Failed to add sale item: ' + err.message);
  }
});

ipcMain.handle('get-sale-items', async (event, saleId) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT si.*, p.name as product_name 
      FROM sales_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId], (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-sale-item-by-id', async (event, id) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT si.*, p.name as product_name 
      FROM sales_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.id = ?
    `, [id], (err, row) => {
      if (err) {
        reject(err.message);
      } else if (!row) {
        reject(new Error('Sale item not found'));
      } else {
        resolve(row);
      }
    });
  });
});

ipcMain.handle('update-sale-item', async (event, saleItem) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const originalItem = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM sales_items WHERE id = ?', [saleItem.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!originalItem) {
      throw new Error('Original sale item not found');
    }

    const quantityDiff = saleItem.quantity - originalItem.quantity;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE sales_items 
         SET product_id = ?, quantity = ?, price_per_unit = ?, 
             discount_per_unit = ?, total_price = ?
         WHERE id = ?`,
        [
          saleItem.product_id,
          saleItem.quantity,
          saleItem.price_per_unit,
          saleItem.discount_per_unit || 0,
          saleItem.total_price,
          saleItem.id
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (quantityDiff !== 0) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
          [quantityDiff, saleItem.product_id],
          function (err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE sales SET total_price = (
          SELECT SUM(total_price) FROM sales_items WHERE sale_id = ?
        ) WHERE id = ?`,
        [saleItem.sale_id, saleItem.sale_id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    await logUserAction({
      action: 'updated sale item',
      linked_action_id: saleItem.id,
      linked_action_table: 'sales_items',
      old_data: JSON.stringify({
        product_id: originalItem.product_id,
        quantity: originalItem.quantity,
        price_per_unit: originalItem.price_per_unit,
        discount_per_unit: originalItem.discount_per_unit,
        total_price: originalItem.total_price
      }),
      new_data: JSON.stringify({
        product_id: saleItem.product_id,
        quantity: saleItem.quantity,
        price_per_unit: saleItem.price_per_unit,
        discount_per_unit: saleItem.discount_per_unit || 0,
        total_price: saleItem.total_price
      }),
      account_id: currentUserId
    });

    db.run("COMMIT");
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    throw new Error('Failed to update sale item: ' + err.message);
  }
});

ipcMain.handle('delete-sale-item', async (event, id) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const item = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM sales_items WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!item) {
      throw new Error('Sale item not found');
    }

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM sales_items WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE products SET quantity_sold = quantity_sold - ? WHERE id = ?`,
        [item.quantity, item.product_id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE sales SET total_price = (
          SELECT SUM(total_price) FROM sales_items WHERE sale_id = ?
        ) WHERE id = ?`,
        [item.sale_id, item.sale_id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    await logUserAction({
      action: 'deleted a sale item',
      linked_action_id: null,
      linked_action_table: 'sales_items',
      old_data: null,
      new_data: null,
      account_id: currentUserId
    });

    db.run("COMMIT");
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    throw new Error('Failed to delete sale item: ' + err.message);
  }
});

// ==================== IMAGE HANDLING ====================
ipcMain.handle('open-file-dialog', async () => {
  return await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
});

ipcMain.handle('get-file-data-url', async (event, filePath) => {
  try {
    const fileData = await fs.readFile(filePath);
    return `data:image/${path.extname(filePath).slice(1)};base64,${fileData.toString('base64')}`;
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('upload-image', async (event, filePath) => {
  try {
    const uploadDir = path.join(app.getPath('userData'), 'Uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(filePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
      throw new Error('Invalid file type. Please upload an image (jpg, png, gif, webp).');
    }

    const uniqueName = `${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, uniqueName);

    await fs.copyFile(filePath, newPath);

    return `Uploads/${uniqueName}`;
  } catch (err) {
    throw new Error('Failed to upload image: ' + err.message);
  }
});

ipcMain.handle('get-image-full-path', async (event, relativePath) => {
  if (!relativePath) return null;

  if (relativePath === 'default-product.png') {
    return path.join(process.cwd(), 'assets/default-product.png');
  }

  return path.join(app.getPath('userData'), relativePath);
});

ipcMain.handle('get-default-image', async () => {
  const defaultImagePath = path.join(process.cwd(), 'assets/default-product.png');
  return `file://${defaultImagePath}`;
});

// ==================== CHECKOUT & RECEIPT HANDLERS ====================
ipcMain.handle('finalize-sale', async (event, saleData) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const saleResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
        [saleData.customer_id, saleData.total_price],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    for (const item of saleData.items) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
           VALUES (?, ?, ?, ?, ?)`,
          [saleResult, item.product_id, item.quantity, item.price_per_unit, item.total_price],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
          [item.quantity, item.product_id],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    await logUserAction({
      action: 'finalized a sale',
      linked_action_id: saleResult,
      linked_action_table: 'sales',
      old_data: null,
      new_data: JSON.stringify({
        customer_id: saleData.customer_id,
        total_price: saleData.total_price,
        items: saleData.items
      }),
      account_id: currentUserId
    });

    db.run("COMMIT");
    return { id: saleResult };
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
});

ipcMain.handle('get-sale-with-items', async (event, saleId) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT s.*, c.name as customer_name 
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.id = ?`,
      [saleId],
      (err, sale) => {
        if (err) {
          reject(err);
          return;
        }

        if (!sale) {
          reject(new Error('Sale not found'));
          return;
        }

        db.all(
          `SELECT si.*, p.name as product_name 
           FROM sales_items si
           JOIN products p ON si.product_id = p.id
           WHERE si.sale_id = ?`,
          [saleId],
          (err, items) => {
            if (err) {
              reject(err);
            } else {
              resolve({ ...sale, items: items || [] });
            }
          }
        );
      }
    );
  });
});

ipcMain.handle('update-sale-and-items', async (event, saleData) => {
  const db = getDb();

  db.run("BEGIN TRANSACTION");

  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    const oldSale = await new Promise((resolve, reject) => {
      db.get('SELECT customer_id, total_price FROM sales WHERE id = ?', [saleData.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!oldSale) {
      throw new Error('Sale not found');
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE sales SET customer_id = ?, total_price = ? WHERE id = ?`,
        [saleData.customer_id, saleData.total_price, saleData.id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const existingItems = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM sales_items WHERE sale_id = ?`,
        [saleData.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const keptItemIds = saleData.items.map(item => item.id).filter(Boolean);
    await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM sales_items WHERE sale_id = ? AND id NOT IN (${keptItemIds.map(() => '?').join(',')})`,
        [saleData.id, ...keptItemIds],
        async function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    for (const item of saleData.items) {
      if (item.id) {
        const existingItem = existingItems.find(i => i.id === item.id);
        const quantityDiff = item.quantity - existingItem.quantity;

        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE sales_items 
             SET product_id = ?, quantity = ?, price_per_unit = ?, total_price = ?
             WHERE id = ?`,
            [item.product_id, item.quantity, item.price_per_unit, item.total_price, item.id],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        if (quantityDiff !== 0) {
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
              [quantityDiff, item.product_id],
              function (err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      } else {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price)
             VALUES (?, ?, ?, ?, ?)`,
            [saleData.id, item.product_id, item.quantity, item.price_per_unit, item.total_price],
            function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
            [item.quantity, item.product_id],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    await logUserAction({
      action: 'updated sale and items',
      linked_action_id: saleData.id,
      linked_action_table: 'sales',
      old_data: JSON.stringify({
        customer_id: oldSale.customer_id,
        total_price: oldSale.total_price,
        items: existingItems
      }),
      new_data: JSON.stringify({
        customer_id: saleData.customer_id,
        total_price: saleData.total_price,
        items: saleData.items
      }),
      account_id: currentUserId
    });

    db.run("COMMIT");
    return { id: saleData.id };
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
});

ipcMain.handle('print-receipt', async (event, saleId, dataUrl) => {
  try {
    const printWin = new BrowserWindow({
      width: 400,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt #${saleId}</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            img { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    printWin.webContents.on('did-finish-load', () => {
      printWin.webContents.print({ silent: false, printBackground: true }, (success, error) => {
        // if (!success) console.error('Print failed:', error);
        printWin.close();
      });
    });

    return { success: true };
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('get-sales-stats', async (event, startDate, endDate) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_price) as total_revenue,
        SUM(total_price - (
          SELECT SUM(p.price_per_unit_bought * si.quantity)
          FROM sales_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = s.id
        )) as total_profit
      FROM sales s
      WHERE date(s.created_at) BETWEEN ? AND ?
    `, [startDate, endDate], (err, row) => {
      if (err) reject(err);
      else resolve(row || { total_sales: 0, total_revenue: 0, total_profit: 0 });
    });
  });
});

ipcMain.handle('get-recent-sales', async (event, startDate, endDate, limit) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT s.id, s.total_price, s.created_at, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE date(s.created_at) BETWEEN ? AND ?
      ORDER BY s.created_at DESC
      LIMIT ?
    `, [startDate, endDate, limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
});

ipcMain.handle('get-top-products', async (event, startDate, endDate, limit) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        p.id,
        p.name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue,
        p.image_path
      FROM sales_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE date(s.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_quantity DESC
      LIMIT ?
    `, [startDate, endDate, limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
});

ipcMain.handle('get-sales-trend', async (event, startDate, endDate) => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        date(s.created_at) as date,
        COUNT(*) as count,
        SUM(total_price) as revenue
      FROM sales s
      WHERE date(s.created_at) BETWEEN ? AND ?
      GROUP BY date(s.created_at)
      ORDER BY date(s.created_at)
    `, [startDate, endDate], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
});


ipcMain.handle('get-user-history', async (event, { page = 1, pageSize = 10 }) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;
      const role = userData.role;

      const offset = (page - 1) * pageSize;
      let query, params;

      if (role === 'admin') {
        query = `
          SELECT uh.*, a.username 
          FROM user_history uh
          LEFT JOIN accounts a ON uh.account_id = a.id
          ORDER BY uh.created_at DESC
          LIMIT ? OFFSET ?
        `;
        params = [pageSize, offset];
      } else {
        query = `
          SELECT uh.*, a.username 
          FROM user_history uh
          LEFT JOIN accounts a ON uh.account_id = a.id
          WHERE uh.account_id = ?
          ORDER BY uh.created_at DESC
          LIMIT ? OFFSET ?
        `;
        params = [currentUserId, pageSize, offset];
      }

      const countQuery = role === 'admin'
        ? `SELECT COUNT(*) as total FROM user_history`
        : `SELECT COUNT(*) as total FROM user_history WHERE account_id = ?`;
      const countParams = role === 'admin' ? [] : [currentUserId];

      const totalResult = await new Promise((resolve, reject) => {
        db.get(countQuery, countParams, (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      });

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err.message);
          return;
        }
        resolve({
          history: rows.map(row => ({
            ...row,
            old_data: row.old_data ? JSON.parse(row.old_data) : null,
            new_data: row.new_data ? JSON.parse(row.new_data) : null
          })),
          pagination: {
            currentPage: page,
            pageSize,
            totalRecords: totalResult,
            totalPages: Math.ceil(totalResult / pageSize)
          }
        });
      });
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-user-history', async (event, historyId) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;
      const role = userData.role;

      // Fetch the history record to verify it exists and is older than 7 days
      const historyRecord = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM user_history WHERE id = ? AND created_at <= datetime('now', '-7 days')`,
          [historyId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!historyRecord) {
        reject('History record not found or is less than 7 days old');
        return;
      }

      // Check if the user has permission to delete the record
      if (role !== 'admin' && historyRecord.account_id !== currentUserId) {
        reject('Unauthorized: You can only delete your own history');
        return;
      }

      // Delete the history record
      db.run(
        `DELETE FROM user_history WHERE id = ?`,
        [historyId],
        async function (err) {
          if (err) {
            reject(err.message);
            return;
          }

          // Log the deletion action
          await logUserAction({
            action: 'deleted a user history record',
            linked_action_id: null,
            linked_action_table: 'user_history',
            old_data: JSON.stringify({
              action: historyRecord.action,
              linked_action_id: historyRecord.linked_action_id,
              linked_action_table: historyRecord.linked_action_table,
              old_data: historyRecord.old_data,
              new_data: historyRecord.new_data,
              account_id: historyRecord.account_id
            }),
            new_data: null,
            account_id: currentUserId
          });

          resolve(this.changes);
        }
      );
    } catch (error) {
      reject('Failed to process deletion: ' + error.message);
    }
  });
});

ipcMain.handle('get-user-history-by-id', async (event, historyId) => {
  const db = getDb();
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf8');
      const userData = JSON.parse(data);
      const currentUserId = userData.id;
      const role = userData.role;

      let query, params;
      if (role === 'admin') {
        query = `
          SELECT uh.*, a.username 
          FROM user_history uh
          LEFT JOIN accounts a ON uh.account_id = a.id
          WHERE uh.id = ?
        `;
        params = [historyId];
      } else {
        query = `
          SELECT uh.*, a.username 
          FROM user_history uh
          LEFT JOIN accounts a ON uh.account_id = a.id
          WHERE uh.id = ? AND uh.account_id = ?
        `;
        params = [historyId, currentUserId];
      }

      db.get(query, params, (err, row) => {
        if (err) {
          reject(err.message);
          return;
        }
        if (!row) {
          reject('History record not found or you are not authorized to view it');
          return;
        }
        resolve({
          ...row,
          old_data: row.old_data ? JSON.parse(row.old_data) : null,
          new_data: row.new_data ? JSON.parse(row.new_data) : null
        });
      });
    } catch (error) {
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

// In your main process file
ipcMain.handle('bulk-delete-user-history', async (event, timeframe) => {
  const db = getDb();
  
  return new Promise(async (resolve, reject) => {
    try {
      // Calculate the cutoff date based on the selected timeframe
      const now = new Date();
      let cutoffDate;
      
      switch(timeframe) {
        case '7days':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '2weeks':
          cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case '3weeks':
          cutoffDate = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
          break;
        case '1month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '2months':
          cutoffDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          return reject('Invalid timeframe specified');
      }
      
      // Format the date for SQLite
      const formattedDate = cutoffDate.toISOString().replace('T', ' ').replace('Z', '');
      
      // Delete records older than the cutoff date
      const query = 'DELETE FROM user_history WHERE created_at <= ?';
      
      db.run(query, [formattedDate], function(err) {
        if (err) {
          reject(err.message);
          return;
        }
        
        resolve({ deletedCount: this.changes });
      });
    } catch (error) {
      reject('Failed to bulk delete history: ' + error.message);
    }
  });
});
