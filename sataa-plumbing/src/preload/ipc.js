// import { ipcMain, app, dialog, BrowserWindow } from 'electron';
// import { getDb } from '../database';
// import bcrypt from 'bcryptjs';
// import fs from 'fs/promises';
// import path from 'path';
// import sqlite3 from 'sqlite3';


// const verboseSqlite3 = sqlite3.verbose();

// const AUTH_FILE = path.join(app.getPath('userData'), 'auth.json');
// const dbPath = path.join(app.getPath('userData'), 'inventory_db.sqlite');
// const db = new verboseSqlite3.Database(dbPath);


// // ==================== AUTHENTICATION HANDLERS ====================
// // ipcMain.handle('login', async (event, { username, password, role }) => {
// //   console.log('Login attempt:', { username, role });
// //   const db = getDb();
// //   return new Promise((resolve, reject) => {
// //     db.get(
// //       `SELECT * FROM accounts WHERE username = ? AND role = ?`,
// //       [username, role],
// //       async (err, row) => {
// //         if (err) {
// //           console.error('Database error during login:', err.message);
// //           reject(err.message);
// //           return;
// //         }
// //         if (!row) {
// //           console.error('No user found for:', { username, role });
// //           reject('Invalid username or role');
// //           return;
// //         }
// //         console.log('User found:', { id: row.id, username: row.username, role: row.role });
// //         const match = await bcrypt.compare(password, row.password_hash);
// //         if (match) {
// //           const userData = { id: row.id, username, role };
// //           console.log('Password match, saving to auth.json:', userData);
// //           try {
// //             const userDataDir = path.dirname(AUTH_FILE);
// //             await fs.mkdir(userDataDir, { recursive: true });
// //             await fs.writeFile(AUTH_FILE, JSON.stringify(userData, null, 2));
// //             console.log('auth.json written successfully at:', AUTH_FILE);
// //             resolve(userData);
// //           } catch (error) {
// //             console.error('Failed to write auth.json:', error.message);
// //             reject('Failed to save auth data: ' + error.message);
// //           }
// //         } else {
// //           console.error('Password mismatch for:', { username, role });
// //           reject('Invalid password');
// //         }
// //       }
// //     );
// //   });
// // });


// ipcMain.handle('login', async (event, { username, password, role }) => {
//   console.log('Login attempt:', { username, role });
//   return new Promise((resolve, reject) => {
//     db.get(
//       `SELECT * FROM accounts WHERE username = ? AND role = ?`,
//       [username, role],
//       async (err, row) => {
//         if (err) {
//           console.error('Database error during login:', err.message);
//           reject(err.message);
//           return;
//         }
//         if (!row) {
//           console.error('No user found for:', { username, role });
//           reject('Invalid username or role');
//           return;
//         }
//         console.log('User found:', { id: row.id, username: row.username, role: row.role });
//         const match = await bcrypt.compare(password, row.password_hash);
//         if (match) {
//           const userData = { id: row.id, username, role };

//           try {
//             const userDataDir = path.dirname(AUTH_FILE);
//             await fs.mkdir(userDataDir, { recursive: true });
//             await fs.writeFile(AUTH_FILE, JSON.stringify(userData, null, 2));

//             resolve(userData);
//           } catch (error) {
//             reject('Failed to save auth data: ' + error.message);
//           }
//         } else {
//           reject('Invalid password');
//         }
//       }
//     );
//   });
// });

// // Get user role
// ipcMain.handle('get-user-role', async () => {
//   try {
//     const data = await fs.readFile(AUTH_FILE, 'utf8');
//     const userData = JSON.parse(data);
//     console.log('Fetched user role:', userData.role);
//     return userData.role;
//   } catch (error) {
//     console.error('Failed to read auth.json:', error.message);
//     return null;
//   }
// });


// ipcMain.handle('logout', async () => {
//   console.log('Logout attempt');
//   try {
//     await fs.unlink(AUTH_FILE).catch((err) => {
//       if (err.code !== 'ENOENT') throw err;
//       console.log('auth.json not found, treated as logged out');
//     });
//     console.log('auth.json deleted successfully');
//     return true;
//   } catch (error) {
//     console.error('Failed to logout:', error.message);
//     throw new Error('Failed to logout: ' + error.message);
//   }
// });

// // ipcMain.handle('get-auth-status', async () => {
// //   console.log('Checking auth status');
// //   try {
// //     const data = await fs.readFile(AUTH_FILE, 'utf8');
// //     console.log('auth.json read successfully:', data);
// //     return JSON.parse(data) || null;
// //   } catch (error) {
// //     if (error.code === 'ENOENT') {
// //       console.log('auth.json not found, user not authenticated');
// //       return null;
// //     }
// //     console.error('Failed to read auth.json:', error.message);
// //     throw new Error('Failed to read auth data: ' + error.message);
// //   }
// // });

// // Get auth status
// ipcMain.handle('get-auth-status', async () => {
//   try {
//     const data = await fs.readFile(AUTH_FILE, 'utf8');
//     const userData = JSON.parse(data);
//     console.log('Auth status:', !!userData);
//     return !!userData;
//   } catch (error) {
//     console.error('Failed to read auth.json for auth status:', error.message);
//     return false;
//   }
// });

// // ==================== ACCOUNT MANAGEMENT ====================
// ipcMain.handle('add-account', async (event, account) => {
//   console.log('Adding account:', account);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     const hashedPassword = bcrypt.hashSync(account.password, 10);
//     db.run(
//       `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
//       [account.username, hashedPassword, account.role],
//       function (err) {
//         if (err) {
//           console.error('Error adding account:', err.message);
//           reject(err.message);
//         } else {
//           console.log('Account added:', { id: this.lastID, ...account });
//           resolve({ id: this.lastID, ...account });
//         }
//       }
//     );
//   });
// });

// ipcMain.handle('get-accounts', async () => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all('SELECT * FROM accounts ORDER BY username ASC', [], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
// });

// ipcMain.handle('update-account', async (event, account) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     let query, params;
    
//     if (account.password) {
//       const hashedPassword = bcrypt.hashSync(account.password, 10);
//       query = 'UPDATE accounts SET username = ?, password_hash = ?, role = ? WHERE id = ?';
//       params = [account.username, hashedPassword, account.role, account.id];
//     } else {
//       query = 'UPDATE accounts SET username = ?, role = ? WHERE id = ?';
//       params = [account.username, account.role, account.id];
//     }
    
//     db.run(query, params, function(err) {
//       if (err) reject(err);
//       else resolve(this.changes);
//     });
//   });
// });

// ipcMain.handle('delete-account', async (event, id) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.run('DELETE FROM accounts WHERE id = ?', [id], function(err) {
//       if (err) reject(err);
//       else resolve(this.changes);
//     });
//   });
// });

// // ==================== CUSTOMER MANAGEMENT ====================
// ipcMain.handle('add-customer', async (event, customer) => {
//   console.log('Adding customer:', customer);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.run(
//       `INSERT INTO customers (name, contact_info, address) VALUES (?, ?, ?)`,
//       [customer.name, customer.contact_info, customer.address],
//       function (err) {
//         if (err) {
//           console.error('Error adding customer:', err.message);
//           reject(err.message);
//         } else {
//           console.log('Customer added:', { id: this.lastID, ...customer });
//           resolve({ id: this.lastID, ...customer });
//         }
//       }
//     );
//   });
// });

// ipcMain.handle('get-customers', async () => {
//   console.log('Fetching customers');
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`SELECT * FROM customers ORDER BY name ASC`, [], (err, rows) => {
//       if (err) {
//         console.error('Error fetching customers:', err.message);
//         reject(err.message);
//       } else {
//         console.log('Customers fetched:', rows);
//         resolve(rows);
//       }
//     });
//   });
// });

// ipcMain.handle('update-customer', async (event, customer) => {
//   console.log('Updating customer:', customer);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.run(
//       `UPDATE customers SET name = ?, contact_info = ?, address = ? WHERE id = ?`,
//       [customer.name, customer.contact_info, customer.address, customer.id],
//       function (err) {
//         if (err) {
//           console.error('Error updating customer:', err.message);
//           reject(err.message);
//         } else {
//           console.log('Customer updated:', this.changes);
//           resolve(this.changes);
//         }
//       }
//     );
//   });
// });

// ipcMain.handle('delete-customer', async (event, id) => {
//   console.log('Deleting customer:', id);
//   const db = getDb();
  
//   // First check if customer has any sales
//   const sales = await new Promise((resolve, reject) => {
//     db.all('SELECT id FROM sales WHERE customer_id = ?', [id], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
  
//   if (sales.length > 0) {
//     throw new Error('Cannot delete customer with associated sales');
//   }
  
//   return new Promise((resolve, reject) => {
//     db.run(`DELETE FROM customers WHERE id = ?`, [id], function (err) {
//       if (err) {
//         console.error('Error deleting customer:', err.message);
//         reject(err.message);
//       } else {
//         console.log('Customer deleted:', this.changes);
//         resolve(this.changes);
//       }
//     });
//   });
// });

// // ==================== PRODUCT CATEGORY MANAGEMENT ====================
// ipcMain.handle('get-product-categories', async () => {
//   console.log('Fetching product categories');
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all('SELECT * FROM product_categories ORDER BY name ASC', [], (err, rows) => {
//       if (err) {
//         console.error('Error fetching product categories:', err);
//         reject(err);
//       } else {
//         console.log('Product categories fetched:', rows);
//         resolve(rows || []);
//       }
//     });
//   });
// });

// ipcMain.handle('add-product-category', async (event, category) => {
//   console.log('Adding product category:', category);
//   const db = getDb();
//   const stmt = db.prepare('INSERT INTO product_categories (name, description, image_path) VALUES (?, ?, ?)');
//   const result = stmt.run(category.name, category.description || null, category.image_path || null);
//   console.log('Product category added:', result.lastInsertRowid);
//   return result.lastInsertRowid;
// });

// ipcMain.handle('update-product-category', async (event, category) => {
//   console.log('Updating product category:', category);
//   const db = getDb();
//   const stmt = db.prepare(`
//     UPDATE product_categories
//     SET name = ?, description = ?, image_path = ?
//     WHERE id = ?
//   `);
//   const result = stmt.run(
//     category.name,
//     category.description || null,
//     category.image_path || null,
//     category.id
//   );
//   console.log('Product category updated:', result.changes);
//   return result.changes;
// });

// ipcMain.handle('delete-product-category', async (event, id) => {
//   console.log('Deleting product category:', id);
//   const db = getDb();
  
//   // First check if any products are using this category
//   const products = await new Promise((resolve, reject) => {
//     db.all('SELECT id FROM products WHERE category_id = ?', [id], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
  
//   if (products.length > 0) {
//     throw new Error('Cannot delete category with associated products');
//   }
  
//   const stmt = db.prepare('DELETE FROM product_categories WHERE id = ?');
//   const result = stmt.run(id);
//   console.log('Product category deleted:', result.changes);
//   return result.changes;
// });

// // ==================== PRODUCT MANAGEMENT ====================
// ipcMain.handle('get-products', async () => {
//   console.log('Fetching products');
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all('SELECT * FROM products ORDER BY name ASC', [], (err, rows) => {
//       if (err) {
//         console.error('Error fetching products:', err);
//         reject(err);
//       } else {
//         console.log('Products fetched:', rows);
//         resolve(rows);
//       }
//     });
//   });
// });

// ipcMain.handle('get-product-by-id', async (event, id) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
//       if (err) {
//         console.error('Error fetching product:', err);
//         reject(err);
//       } else if (!row) {
//         console.log('Product not found:', id);
//         reject(new Error('Product not found'));
//       } else {
//         console.log('Product fetched:', row);
//         resolve(row);
//       }
//     });
//   });
// });

// ipcMain.handle('update-product', async (event, product) => {
//   console.log('Updating product:', product);
//   const db = getDb();
//   const stmt = db.prepare(`
//     UPDATE products
//     SET name = ?, category_id = ?, size = ?, color = ?, price_per_unit_bought = ?,
//         price_per_unit_sold = ?, quantity_bought = ?, quantity_sold = ?,
//         weight = ?, weight_unit = ?, total_price_bought = ?, image_path = ?
//     WHERE id = ?
//   `);
//   const result = stmt.run(
//     product.name,
//     product.category_id,
//     product.size || null,
//     product.color || null,
//     product.price_per_unit_bought,
//     product.price_per_unit_sold,
//     product.quantity_bought,
//     product.quantity_sold,
//     product.weight || null,
//     product.weight_unit || null,
//     product.total_price_bought,
//     product.image_path || null,
//     product.id
//   );
//   console.log('Product updated:', result.changes);
//   return result.changes;
// });

// ipcMain.handle('delete-product', async (event, id) => {
//   console.log('Deleting product:', id);
//   const db = getDb();
  
//   // First check if product is in any sales
//   const saleItems = await new Promise((resolve, reject) => {
//     db.all('SELECT id FROM sales_items WHERE product_id = ?', [id], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
  
//   // if (saleItems.length > 0) {
//   //   throw new Error('Cannot delete product with associated sales');
//   // }
  
//   const stmt = db.prepare('DELETE FROM products WHERE id = ?');
//   const result = stmt.run(id);
//   console.log('Product deleted:', result.changes);
//   return result.changes;
// });

// ipcMain.handle('add-product', async (event, product) => {
//   console.log('Adding product:', product);
//   const db = getDb();
//   const stmt = db.prepare(`
//     INSERT INTO products (category_id, name, size, color, price_per_unit_bought, price_per_unit_sold,
//                          quantity_bought, quantity_sold, weight, weight_unit, total_price_bought, image_path)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `);
//   const result = stmt.run(
//     product.category_id,
//     product.name,
//     product.size || null,
//     product.color || null,
//     product.price_per_unit_bought,
//     product.price_per_unit_sold,
//     product.quantity_bought,
//     product.quantity_sold || 0,
//     product.weight || null,
//     product.weight_unit || null,
//     product.total_price_bought,
//     product.image_path || null
//   );
//   console.log('Product added:', result.lastInsertRowid);
//   return result.lastInsertRowid;
// });

// // ==================== SALES MANAGEMENT ====================
// ipcMain.handle('add-sale', async (event, saleData) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.run(
//       `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
//       [saleData.customer_id, saleData.total_price],
//       function(err) {
//         if (err) {
//           console.error('Error creating sale:', err.message);
//           reject(err.message);
//         } else {
//           console.log('Sale created with ID:', this.lastID);
//           resolve({ id: this.lastID });
//         }
//       }
//     );
//   });
// });

// ipcMain.handle('get-sales-by-customer', async (event, customerId) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT 
//         s.id,
//         s.total_price,
//         s.created_at,
//         (
//           SELECT json_group_array(
//             json_object(
//               'product_id', si.product_id,
//               'product_name', p.name,
//               'quantity', si.quantity,
//               'price_per_unit', si.price_per_unit,
//               'total_price', si.total_price
//             )
//           )
//           FROM sales_items si
//           JOIN products p ON si.product_id = p.id
//           WHERE si.sale_id = s.id
//         ) as items
//       FROM sales s
//       WHERE s.customer_id = ?
//       ORDER BY s.created_at DESC
//     `, [customerId], (err, rows) => {
//       if (err) {
//         console.error('Error fetching customer sales:', err.message);
//         reject(err.message);
//       } else {
//         // Parse the JSON items array for each sale
//         const sales = rows.map(row => ({
//           ...row,
//           items: row.items ? JSON.parse(row.items) : []
//         }));
//         resolve(sales);
//       }
//     });
//   });
// });

// ipcMain.handle('create-sale', async (event, saleData) => {
//   const db = getDb();
  
//   // Use transaction to ensure all operations succeed or fail together
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // 1. Create the sale record
//     const saleResult = await new Promise((resolve, reject) => {
//       db.run(
//         `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
//         [saleData.customerId, saleData.items.reduce((sum, item) => sum + item.total_price, 0)],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.lastID);
//         }
//       );
//     });
    
//     // 2. Create all sale items
//     for (const item of saleData.items) {
//       await new Promise((resolve, reject) => {
//         db.run(
//           `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
//            VALUES (?, ?, ?, ?, ?)`,
//           [saleResult, item.product_id, item.quantity, item.price, item.total_price],
//           function(err) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
      
//       // 3. Update product quantity_sold
//       await new Promise((resolve, reject) => {
//         db.run(
//           `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//           [item.quantity, item.product_id],
//           function(err) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
//     }
    
//     db.run("COMMIT");
//     return { id: saleResult };
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error creating sale:', err);
//     throw err;
//   }
// });

// ipcMain.handle('get-sales', async () => {
//   console.log('Fetching sales');
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT s.*, c.name as customer_name 
//       FROM sales s
//       LEFT JOIN customers c ON s.customer_id = c.id
//       ORDER BY s.created_at DESC
//     `, [], (err, rows) => {
//       if (err) {
//         console.error('Error fetching sales:', err.message);
//         reject(err.message);
//       } else {
//         console.log('Sales fetched:', rows);
//         resolve(rows);
//       }
//     });
//   });
// });

// ipcMain.handle('get-sale-by-id', async (event, id) => {
//   console.log('Fetching sale:', id);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.get(`
//       SELECT s.*, c.name as customer_name 
//       FROM sales s
//       LEFT JOIN customers c ON s.customer_id = c.id
//       WHERE s.id = ?
//     `, [id], (err, row) => {
//       if (err) {
//         console.error('Error fetching sale:', err.message);
//         reject(err.message);
//       } else if (!row) {
//         console.log('Sale not found:', id);
//         reject(new Error('Sale not found'));
//       } else {
//         console.log('Sale fetched:', row);
//         resolve(row);
//       }
//     });
//   });
// });

// ipcMain.handle('update-sale', async (event, sale) => {
//   console.log('Updating sale:', sale);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.run(
//       `UPDATE sales SET customer_id = ?, total_price = ? WHERE id = ?`,
//       [sale.customer_id, sale.total_price, sale.id],
//       function (err) {
//         if (err) {
//           console.error('Error updating sale:', err.message);
//           reject(err.message);
//         } else {
//           console.log('Sale updated:', this.changes);
//           resolve(this.changes);
//         }
//       }
//     );
//   });
// });

// ipcMain.handle('delete-sale', async (event, id) => {
//   console.log('Deleting sale:', id);
//   const db = getDb();
  
//   // Use transaction to ensure atomic operation
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // First delete all sale items
//     await new Promise((resolve, reject) => {
//       db.run('DELETE FROM sales_items WHERE sale_id = ?', [id], function(err) {
//         if (err) reject(err);
//         else resolve(this.changes);
//       });
//     });
    
//     // Then delete the sale
//     const result = await new Promise((resolve, reject) => {
//       db.run('DELETE FROM sales WHERE id = ?', [id], function(err) {
//         if (err) reject(err);
//         else resolve(this.changes);
//       });
//     });
    
//     db.run("COMMIT");
//     console.log('Sale deleted:', result);
//     return result;
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error deleting sale:', err.message);
//     throw new Error('Failed to delete sale: ' + err.message);
//   }
// });

// // ==================== SALE ITEMS MANAGEMENT ====================
// ipcMain.handle('add-sale-item', async (event, saleItem) => {
//   const db = getDb();
  
//   // Use transaction to ensure atomic operation
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // 1. Add the sale item
//     await new Promise((resolve, reject) => {
//       db.run(
//         `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
//          VALUES (?, ?, ?, ?, ?)`,
//         [
//           saleItem.sale_id,
//           saleItem.product_id,
//           saleItem.quantity,
//           saleItem.price_per_unit,
//           saleItem.total_price
//         ],
//         function(err) {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });
    
//     // 2. Update product quantity_sold
//     await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//         [saleItem.quantity, saleItem.product_id],
//         function(err) {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });
    
//     db.run("COMMIT");
//     return true;
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error adding sale item:', err.message);
//     throw new Error('Failed to add sale item: ' + err.message);
//   }
// });

// ipcMain.handle('get-sale-items', async (event, saleId) => {
//   console.log('Fetching sale items for saleId:', saleId);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT si.*, p.name as product_name 
//       FROM sales_items si
//       LEFT JOIN products p ON si.product_id = p.id
//       WHERE si.sale_id = ?
//     `, [saleId], (err, rows) => {
//       if (err) {
//         console.error('Error fetching sale items:', err.message);
//         reject(err.message);
//       } else {
//         console.log('Sale items fetched:', rows);
//         resolve(rows);
//       }
//     });
//   });
// });

// ipcMain.handle('get-sale-item-by-id', async (event, id) => {
//   console.log('Fetching sale item:', id);
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.get(`
//       SELECT si.*, p.name as product_name 
//       FROM sales_items si
//       LEFT JOIN products p ON si.product_id = p.id
//       WHERE si.id = ?
//     `, [id], (err, row) => {
//       if (err) {
//         console.error('Error fetching sale item:', err.message);
//         reject(err.message);
//       } else if (!row) {
//         console.log('Sale item not found:', id);
//         reject(new Error('Sale item not found'));
//       } else {
//         console.log('Sale item fetched:', row);
//         resolve(row);
//       }
//     });
//   });
// });

// ipcMain.handle('update-sale-item', async (event, saleItem) => {
//   console.log('Updating sale item:', saleItem);
//   const db = getDb();
  
//   // Use transaction to ensure data consistency
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // First get the original item to calculate quantity difference
//     const originalItem = await new Promise((resolve, reject) => {
//       db.get('SELECT * FROM sales_items WHERE id = ?', [saleItem.id], (err, row) => {
//         if (err) reject(err);
//         else resolve(row);
//       });
//     });
    
//     if (!originalItem) {
//       throw new Error('Original sale item not found');
//     }
    
//     const quantityDiff = saleItem.quantity - originalItem.quantity;
    
//     // Update the sale item
//     const result = await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE sales_items 
//          SET product_id = ?, quantity = ?, price_per_unit = ?, 
//              discount_per_unit = ?, total_price = ?
//          WHERE id = ?`,
//         [
//           saleItem.product_id,
//           saleItem.quantity,
//           saleItem.price_per_unit,
//           saleItem.discount_per_unit || 0,
//           saleItem.total_price,
//           saleItem.id
//         ],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.changes);
//         }
//       );
//     });
    
//     // Update the product's sold quantity if it changed
//     if (quantityDiff !== 0) {
//       await new Promise((resolve, reject) => {
//         db.run(
//           `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//           [quantityDiff, saleItem.product_id],
//           function(err) {
//             if (err) reject(err);
//             else resolve(this.changes);
//           }
//         );
//       });
//     }
    
//     // Update the sale's total price
//     await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE sales SET total_price = (
//           SELECT SUM(total_price) FROM sales_items WHERE sale_id = ?
//         ) WHERE id = ?`,
//         [saleItem.sale_id, saleItem.sale_id],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.changes);
//         }
//       );
//     });
    
//     db.run("COMMIT");
//     console.log('Sale item updated:', result);
//     return result;
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error updating sale item:', err.message);
//     throw new Error('Failed to update sale item: ' + err.message);
//   }
// });

// ipcMain.handle('delete-sale-item', async (event, id) => {
//   console.log('Deleting sale item:', id);
//   const db = getDb();
  
//   // Use transaction to ensure data consistency
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // First get the item to update product quantity
//     const item = await new Promise((resolve, reject) => {
//       db.get('SELECT * FROM sales_items WHERE id = ?', [id], (err, row) => {
//         if (err) reject(err);
//         else resolve(row);
//       });
//     });
    
//     if (!item) {
//       throw new Error('Sale item not found');
//     }
    
//     // Delete the sale item
//     const result = await new Promise((resolve, reject) => {
//       db.run('DELETE FROM sales_items WHERE id = ?', [id], function(err) {
//         if (err) reject(err);
//         else resolve(this.changes);
//       });
//     });
    
//     // Update the product's sold quantity
//     await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE products SET quantity_sold = quantity_sold - ? WHERE id = ?`,
//         [item.quantity, item.product_id],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.changes);
//         }
//       );
//     });
    
//     // Update the sale's total price
//     await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE sales SET total_price = (
//           SELECT SUM(total_price) FROM sales_items WHERE sale_id = ?
//         ) WHERE id = ?`,
//         [item.sale_id, item.sale_id],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.changes);
//         }
//       );
//     });
    
//     db.run("COMMIT");
//     console.log('Sale item deleted:', result);
//     return result;
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error deleting sale item:', err.message);
//     throw new Error('Failed to delete sale item: ' + err.message);
//   }
// });

// // ==================== IMAGE HANDLING ====================
// ipcMain.handle('open-file-dialog', async () => {
//   return await dialog.showOpenDialog({
//     properties: ['openFile'],
//     filters: [
//       { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
//       { name: 'All Files', extensions: ['*'] }
//     ]
//   });
// });

// ipcMain.handle('get-file-data-url', async (event, filePath) => {
//   try {
//     const fileData = await fs.readFile(filePath);
//     return `data:image/${path.extname(filePath).slice(1)};base64,${fileData.toString('base64')}`;
//   } catch (err) {
//     console.error('Error creating data URL:', err);
//     throw err;
//   }
// });

// ipcMain.handle('upload-image', async (event, filePath) => {
//   try {
//     const uploadDir = path.join(app.getPath('userData'), 'Uploads');
//     await fs.mkdir(uploadDir, { recursive: true });

//     // Validate file extension
//     const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
//     const ext = path.extname(filePath).toLowerCase();
//     if (!validExtensions.includes(ext)) {
//       throw new Error('Invalid file type. Please upload an image (jpg, png, gif, webp).');
//     }

//     // Generate unique filename
//     const uniqueName = `${Date.now()}${ext}`;
//     const newPath = path.join(uploadDir, uniqueName);

//     // Copy file to uploads directory
//     await fs.copyFile(filePath, newPath);
    
//     // Return relative path
//     return `Uploads/${uniqueName}`;
//   } catch (err) {
//     console.error('Upload failed:', err);
//     throw new Error('Failed to upload image: ' + err.message);
//   }
// });

// ipcMain.handle('get-image-full-path', async (event, relativePath) => {
//   if (!relativePath) return null;
  
//   if (relativePath === 'default-product.png') {
//     return path.join(process.cwd(), 'assets/default-product.png');
//   }
  
//   // Convert relative path to absolute path
//   return path.join(app.getPath('userData'), relativePath);
// });

// ipcMain.handle('get-default-image', async () => {
//   const defaultImagePath = path.join(process.cwd(), 'assets/default-product.png');
//   return `file://${defaultImagePath}`;
// });

// // ==================== CHECKOUT & RECEIPT HANDLERS ====================
// ipcMain.handle('finalize-sale', async (event, saleData) => {
//   const db = getDb();
  
//   // Use transaction to ensure all operations succeed or fail together
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // 1. Create the sale record
//     const saleResult = await new Promise((resolve, reject) => {
//       db.run(
//         `INSERT INTO sales (customer_id, total_price) VALUES (?, ?)`,
//         [saleData.customer_id, saleData.total_price],
//         function(err) {
//           if (err) reject(err);
//           else resolve(this.lastID);
//         }
//       );
//     });
    
//     // 2. Create all sale items and update product quantities
//     for (const item of saleData.items) {
//       await new Promise((resolve, reject) => {
//         db.run(
//           `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price) 
//            VALUES (?, ?, ?, ?, ?)`,
//           [saleResult, item.product_id, item.quantity, item.price_per_unit, item.total_price],
//           function(err) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
      
//       await new Promise((resolve, reject) => {
//         db.run(
//           `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//           [item.quantity, item.product_id],
//           function(err) {
//             if (err) reject(err);
//             else resolve();
//           }
//         );
//       });
//     }
    
//     db.run("COMMIT");
//     return { id: saleResult };
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error finalizing sale:', err);
//     throw err;
//   }
// });

// ipcMain.handle('get-sale-with-items', async (event, saleId) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.get(
//       `SELECT s.*, c.name as customer_name 
//        FROM sales s
//        LEFT JOIN customers c ON s.customer_id = c.id
//        WHERE s.id = ?`,
//       [saleId],
//       (err, sale) => {
//         if (err) {
//           reject(err);
//           return;
//         }

//         if (!sale) {
//           reject(new Error('Sale not found'));
//           return;
//         }

//         db.all(
//           `SELECT si.*, p.name as product_name 
//            FROM sales_items si
//            JOIN products p ON si.product_id = p.id
//            WHERE si.sale_id = ?`,
//           [saleId],
//           (err, items) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve({ ...sale, items: items || [] });
//             }
//           }
//         );
//       }
//     );
//   });
// });

// ipcMain.handle('update-sale-and-items', async (event, saleData) => {
//   const db = getDb();
  
//   // Use transaction to ensure all operations succeed or fail together
//   db.run("BEGIN TRANSACTION");
  
//   try {
//     // 1. Update the sale record
//     await new Promise((resolve, reject) => {
//       db.run(
//         `UPDATE sales SET customer_id = ?, total_price = ? WHERE id = ?`,
//         [saleData.customer_id, saleData.total_price, saleData.id],
//         function(err) {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });
    
//     // 2. Get existing items to calculate quantity differences
//     const existingItems = await new Promise((resolve, reject) => {
//       db.all(
//         `SELECT * FROM sales_items WHERE sale_id = ?`,
//         [saleData.id],
//         (err, rows) => {
//           if (err) reject(err);
//           else resolve(rows);
//         }
//       );
//     });
    
//     // 3. Delete items that were removed
//     const keptItemIds = saleData.items.map(item => item.id).filter(Boolean);
//     await new Promise((resolve, reject) => {
//       db.run(
//         `DELETE FROM sales_items WHERE sale_id = ? AND id NOT IN (${keptItemIds.map(() => '?').join(',')})`,
//         [saleData.id, ...keptItemIds],
//         function(err) {
//           if (err) reject(err);
//           else resolve();
//         }
//       );
//     });
    
//     // 4. Update or insert items and adjust product quantities
//     for (const item of saleData.items) {
//       if (item.id) {
//         // Update existing item
//         const existingItem = existingItems.find(i => i.id === item.id);
//         const quantityDiff = item.quantity - existingItem.quantity;
        
//         await new Promise((resolve, reject) => {
//           db.run(
//             `UPDATE sales_items 
//              SET product_id = ?, quantity = ?, price_per_unit = ?, total_price = ?
//              WHERE id = ?`,
//             [item.product_id, item.quantity, item.price_per_unit, item.total_price, item.id],
//             function(err) {
//               if (err) reject(err);
//               else resolve();
//             }
//           );
//         });
        
//         if (quantityDiff !== 0) {
//           await new Promise((resolve, reject) => {
//             db.run(
//               `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//               [quantityDiff, item.product_id],
//               function(err) {
//                 if (err) reject(err);
//                 else resolve();
//               }
//             );
//           });
//         }
//       } else {
//         // Insert new item
//         await new Promise((resolve, reject) => {
//           db.run(
//             `INSERT INTO sales_items (sale_id, product_id, quantity, price_per_unit, total_price)
//              VALUES (?, ?, ?, ?, ?)`,
//             [saleData.id, item.product_id, item.quantity, item.price_per_unit, item.total_price],
//             function(err) {
//               if (err) reject(err);
//               else resolve();
//             }
//           );
//         });
        
//         await new Promise((resolve, reject) => {
//           db.run(
//             `UPDATE products SET quantity_sold = quantity_sold + ? WHERE id = ?`,
//             [item.quantity, item.product_id],
//             function(err) {
//               if (err) reject(err);
//               else resolve();
//             }
//           );
//         });
//       }
//     }
    
//     db.run("COMMIT");
//     return { id: saleData.id };
//   } catch (err) {
//     db.run("ROLLBACK");
//     console.error('Error updating sale:', err);
//     throw err;
//   }
// });

// // ipcMain.handle('print-receipt', async (event, saleId) => {
// //   // This is a placeholder - you'll need to implement actual printing logic
// //   // For now, we'll just return the sale data that would be printed
// //   try {
// //     const sale = await new Promise((resolve, reject) => {
// //       getDb().get(
// //         `SELECT s.*, c.name as customer_name 
// //          FROM sales s
// //          LEFT JOIN customers c ON s.customer_id = c.id
// //          WHERE s.id = ?`,
// //         [saleId],
// //         (err, row) => {
// //           if (err) reject(err);
// //           else resolve(row);
// //         }
// //       );
// //     });

// //     const items = await new Promise((resolve, reject) => {
// //       getDb().all(
// //         `SELECT si.*, p.name as product_name 
// //          FROM sales_items si
// //          JOIN products p ON si.product_id = p.id
// //          WHERE si.sale_id = ?`,
// //         [saleId],
// //         (err, rows) => {
// //           if (err) reject(err);
// //           else resolve(rows);
// //         }
// //       );
// //     });

// //     return { sale, items };
// //   } catch (err) {
// //     console.error('Error generating receipt:', err);
// //     throw err;
// //   }
// // });


// ipcMain.handle('print-receipt', async (event, saleId, dataUrl) => {
//   try {
//     // Create a hidden window for printing
//     const printWin = new BrowserWindow({
//       width: 400,
//       height: 600,
//       show: false,
//       webPreferences: {
//         nodeIntegration: false,
//         contextIsolation: true,
//       }
//     });

//     // Load receipt HTML directly with the dataUrl
//     const html = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <title>Receipt #${saleId}</title>
//           <style>
//             body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
//             img { width: 100%; height: auto; }
//           </style>
//         </head>
//         <body>
//           <img src="${dataUrl}" />
//           <script>
//             window.onload = function() {
//               window.print();
//             }
//           </script>
//         </body>
//       </html>
//     `;

//     await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

//     // Wait for page to load, then print
//     printWin.webContents.on('did-finish-load', () => {
//       printWin.webContents.print({ silent: false, printBackground: true }, (success, error) => {
//         if (!success) console.error('Print failed:', error);
//         printWin.close();
//       });
//     });

//     return { success: true };
//   } catch (err) {
//     console.error('Error printing receipt:', err);
//     throw err;
//   }
// });

// ipcMain.handle('get-sales-stats', async (event, startDate, endDate) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.get(`
//       SELECT 
//         COUNT(*) as total_sales,
//         SUM(total_price) as total_revenue,
//         SUM(total_price - (
//           SELECT SUM(p.price_per_unit_bought * si.quantity)
//           FROM sales_items si
//           JOIN products p ON si.product_id = p.id
//           WHERE si.sale_id = s.id
//         )) as total_profit
//       FROM sales s
//       WHERE date(s.created_at) BETWEEN ? AND ?
//     `, [startDate, endDate], (err, row) => {
//       if (err) reject(err);
//       else resolve(row || { total_sales: 0, total_revenue: 0, total_profit: 0 });
//     });
//   });
// });

// ipcMain.handle('get-recent-sales', async (event, startDate, endDate, limit) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT s.id, s.total_price, s.created_at, c.name as customer_name
//       FROM sales s
//       LEFT JOIN customers c ON s.customer_id = c.id
//       WHERE date(s.created_at) BETWEEN ? AND ?
//       ORDER BY s.created_at DESC
//       LIMIT ?
//     `, [startDate, endDate, limit], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows || []);
//     });
//   });
// });

// ipcMain.handle('get-top-products', async (event, startDate, endDate, limit) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT 
//         p.id,
//         p.name,
//         SUM(si.quantity) as total_quantity,
//         SUM(si.total_price) as total_revenue,
//         p.image_path
//       FROM sales_items si
//       JOIN products p ON si.product_id = p.id
//       JOIN sales s ON si.sale_id = s.id
//       WHERE date(s.created_at) BETWEEN ? AND ?
//       GROUP BY p.id
//       ORDER BY total_quantity DESC
//       LIMIT ?
//     `, [startDate, endDate, limit], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows || []);
//     });
//   });
// });

// ipcMain.handle('get-sales-trend', async (event, startDate, endDate) => {
//   const db = getDb();
//   return new Promise((resolve, reject) => {
//     db.all(`
//       SELECT 
//         date(s.created_at) as date,
//         COUNT(*) as count,
//         SUM(total_price) as revenue
//       FROM sales s
//       WHERE date(s.created_at) BETWEEN ? AND ?
//       GROUP BY date(s.created_at)
//       ORDER BY date(s.created_at)
//     `, [startDate, endDate], (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows || []);
//     });
//   });
// });


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
  console.log('Login attempt:', { username, role });
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM accounts WHERE username = ? AND role = ?`,
      [username, role],
      async (err, row) => {
        if (err) {
          console.error('Database error during login:', err.message);
          reject(err.message);
          return;
        }
        if (!row) {
          console.error('No user found for:', { username, role });
          reject('Invalid username or role');
          return;
        }
        console.log('User found:', { id: row.id, username: row.username, role: row.role });
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
            console.error('Failed to write auth.json:', error.message);
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
    console.log('Fetched user role:', userData.role);
    return userData.role;
  } catch (error) {
    console.error('Failed to read auth.json:', error.message);
    return null;
  }
});

ipcMain.handle('logout', async () => {
  console.log('Logout attempt');
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    const currentUserId = userData.id;

    await fs.unlink(AUTH_FILE).catch((err) => {
      if (err.code !== 'ENOENT') throw err;
      console.log('auth.json not found, treated as logged out');
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
    console.log('auth.json deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to logout:', error.message);
    throw new Error('Failed to logout: ' + error.message);
  }
});

ipcMain.handle('get-auth-status', async () => {
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    const userData = JSON.parse(data);
    console.log('Auth status:', !!userData);
    return !!userData;
  } catch (error) {
    console.error('Failed to read auth.json for auth status:', error.message);
    return false;
  }
});

// ==================== ACCOUNT MANAGEMENT ====================
ipcMain.handle('add-account', async (event, account) => {
  console.log('Adding account:', account);
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
            console.error('Error adding account:', err.message);
            reject(err.message);
          } else {
            console.log('Account added:', { id: this.lastID, ...account });
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
      console.error('Error reading AUTH_FILE:', error.message);
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
          console.error('Error updating account:', err.message);
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
          console.log('Account updated:', this.changes);
          resolve(this.changes);
        }
      });
    } catch (error) {
      console.error('Error reading AUTH_FILE:', error.message);
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
          console.error('Error deleting account:', err.message);
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
          console.log('Account deleted:', this.changes);
          resolve(this.changes);
        }
      });
    } catch (error) {
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

// ==================== CUSTOMER MANAGEMENT ====================
ipcMain.handle('add-customer', async (event, customer) => {
  console.log('Adding customer:', customer);
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
            console.error('Error adding customer:', err.message);
            reject(err.message);
          } else {
            console.log('Customer added:', { id: this.lastID, ...customer });
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
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('get-customers', async () => {
  console.log('Fetching customers');
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM customers ORDER BY name ASC`, [], (err, rows) => {
      if (err) {
        console.error('Error fetching customers:', err.message);
        reject(err.message);
      } else {
        console.log('Customers fetched:', rows);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('update-customer', async (event, customer) => {
  console.log('Updating customer:', customer);
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
            console.error('Error updating customer:', err.message);
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
            console.log('Customer updated:', this.changes);
            resolve(this.changes);
          }
        }
      );
    } catch (error) {
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-customer', async (event, id) => {
  console.log('Deleting customer:', id);
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
          console.error('Error deleting customer:', err.message);
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
          console.log('Customer deleted:', this.changes);
          resolve(this.changes);
        }
      });
    });
  } catch (error) {
    console.error('Error reading AUTH_FILE or checking sales:', error.message);
    throw new Error('Failed to delete customer: ' + error.message);
  }
});

// ==================== PRODUCT CATEGORY MANAGEMENT ====================
ipcMain.handle('get-product-categories', async () => {
  console.log('Fetching product categories');
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_categories ORDER BY name ASC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching product categories:', err);
        reject(err);
      } else {
        console.log('Product categories fetched:', rows);
        resolve(rows || []);
      }
    });
  });
});

ipcMain.handle('add-product-category', async (event, category) => {
  console.log('Adding product category:', category);
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
      console.log('Product category added:', result.lastInsertRowid);
      resolve(result.lastInsertRowid);
    } catch (error) {
      console.error('Error reading AUTH_FILE or adding category:', error.message);
      reject('Failed to add product category: ' + error.message);
    }
  });
});

ipcMain.handle('update-product-category', async (event, category) => {
  console.log('Updating product category:', category);
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
      console.log('Product category updated:', result.changes);
      resolve(result.changes);
    } catch (error) {
      console.error('Error reading AUTH_FILE or updating category:', error.message);
      reject('Failed to update product category: ' + error.message);
    }
  });
});

ipcMain.handle('delete-product-category', async (event, id) => {
  console.log('Deleting product category:', id);
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
    console.log('Product category deleted:', result.changes);
    return result.changes;
  } catch (error) {
    console.error('Error reading AUTH_FILE or deleting category:', error.message);
    throw new Error('Failed to delete product category: ' + error.message);
  }
});

// ==================== PRODUCT MANAGEMENT ====================
ipcMain.handle('get-products', async () => {
  console.log('Fetching products');
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY name ASC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching products:', err);
        reject(err);
      } else {
        console.log('Products fetched:', rows);
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
        console.error('Error fetching product:', err);
        reject(err);
      } else if (!row) {
        console.log('Product not found:', id);
        reject(new Error('Product not found'));
      } else {
        console.log('Product fetched:', row);
        resolve(row);
      }
    });
  });
});

ipcMain.handle('add-product', async (event, product) => {
  console.log('Adding product:', product);
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
      console.log('Product added:', result.lastInsertRowid);
      resolve(result.lastInsertRowid);
    } catch (error) {
      console.error('Error reading AUTH_FILE or adding product:', error.message);
      reject('Failed to add product: ' + error.message);
    }
  });
});

ipcMain.handle('update-product', async (event, product) => {
  console.log('Updating product:', product);
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
      console.log('Product updated:', result.changes);
      resolve(result.changes);
    } catch (error) {
      console.error('Error reading AUTH_FILE or updating product:', error.message);
      reject('Failed to update product: ' + error.message);
    }
  });
});

ipcMain.handle('delete-product', async (event, id) => {
  console.log('Deleting product:', id);
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
          console.error('Error deleting product:', err.message);
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
          console.log('Product deleted:', this.changes);
          resolve(this.changes);
        }
      });
    });
  } catch (error) {
    console.error('Error reading AUTH_FILE or deleting product:', error.message);
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
            console.error('Error creating sale:', err.message);
            reject(err.message);
          } else {
            console.log('Sale created with ID:', this.lastID);
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
      console.error('Error reading AUTH_FILE:', error.message);
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
        console.error('Error fetching customer sales:', err.message);
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
    console.error('Error creating sale:', err);
    throw err;
  }
});

ipcMain.handle('get-sales', async () => {
  console.log('Fetching sales');
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT s.*, c.name as customer_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching sales:', err.message);
        reject(err.message);
      } else {
        console.log('Sales fetched:', rows);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-sale-by-id', async (event, id) => {
  console.log('Fetching sale:', id);
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT s.*, c.name as customer_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Error fetching sale:', err.message);
        reject(err.message);
      } else if (!row) {
        console.log('Sale not found:', id);
        reject(new Error('Sale not found'));
      } else {
        console.log('Sale fetched:', row);
        resolve(row);
      }
    });
  });
});

ipcMain.handle('update-sale', async (event, sale) => {
  console.log('Updating sale:', sale);
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
            console.error('Error updating sale:', err.message);
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
            console.log('Sale updated:', this.changes);
            resolve(this.changes);
          }
        }
      );
    } catch (error) {
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-sale', async (event, id) => {
  console.log('Deleting sale:', id);
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
    console.log('Sale deleted:', result);
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    console.error('Error deleting sale:', err.message);
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
    console.error('Error adding sale item:', err.message);
    throw new Error('Failed to add sale item: ' + err.message);
  }
});

ipcMain.handle('get-sale-items', async (event, saleId) => {
  console.log('Fetching sale items for saleId:', saleId);
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT si.*, p.name as product_name 
      FROM sales_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId], (err, rows) => {
      if (err) {
        console.error('Error fetching sale items:', err.message);
        reject(err.message);
      } else {
        console.log('Sale items fetched:', rows);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-sale-item-by-id', async (event, id) => {
  console.log('Fetching sale item:', id);
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT si.*, p.name as product_name 
      FROM sales_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Error fetching sale item:', err.message);
        reject(err.message);
      } else if (!row) {
        console.log('Sale item not found:', id);
        reject(new Error('Sale item not found'));
      } else {
        console.log('Sale item fetched:', row);
        resolve(row);
      }
    });
  });
});

ipcMain.handle('update-sale-item', async (event, saleItem) => {
  console.log('Updating sale item:', saleItem);
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
    console.log('Sale item updated:', result);
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    console.error('Error updating sale item:', err.message);
    throw new Error('Failed to update sale item: ' + err.message);
  }
});

ipcMain.handle('delete-sale-item', async (event, id) => {
  console.log('Deleting sale item:', id);
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
    console.log('Sale item deleted:', result);
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    console.error('Error deleting sale item:', err.message);
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
    console.error('Error creating data URL:', err);
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
    console.error('Upload failed:', err);
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
    console.error('Error finalizing sale:', err);
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
    console.error('Error updating sale:', err);
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
        if (!success) console.error('Print failed:', error);
        printWin.close();
      });
    });

    return { success: true };
  } catch (err) {
    console.error('Error printing receipt:', err);
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
  console.log('Fetching user history:', { page, pageSize });
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
          console.error('Error fetching user history:', err.message);
          reject(err.message);
          return;
        }
        console.log('User history fetched:', rows);
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
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

ipcMain.handle('delete-user-history', async (event, historyId) => {
  console.log('Deleting user history:', historyId);
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
        console.error('History record not found or not older than 7 days:', historyId);
        reject('History record not found or is less than 7 days old');
        return;
      }

      // Check if the user has permission to delete the record
      if (role !== 'admin' && historyRecord.account_id !== currentUserId) {
        console.error('Unauthorized attempt to delete history:', { historyId, currentUserId });
        reject('Unauthorized: You can only delete your own history');
        return;
      }

      // Delete the history record
      db.run(
        `DELETE FROM user_history WHERE id = ?`,
        [historyId],
        async function (err) {
          if (err) {
            console.error('Error deleting user history:', err.message);
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

          console.log('User history deleted:', this.changes);
          resolve(this.changes);
        }
      );
    } catch (error) {
      console.error('Error reading AUTH_FILE or processing deletion:', error.message);
      reject('Failed to process deletion: ' + error.message);
    }
  });
});

ipcMain.handle('get-user-history-by-id', async (event, historyId) => {
  console.log('Fetching user history by ID:', historyId);
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
          console.error('Error fetching user history by ID:', err.message);
          reject(err.message);
          return;
        }
        if (!row) {
          console.error('History record not found or unauthorized:', historyId);
          reject('History record not found or you are not authorized to view it');
          return;
        }
        console.log('User history fetched:', row);
        resolve({
          ...row,
          old_data: row.old_data ? JSON.parse(row.old_data) : null,
          new_data: row.new_data ? JSON.parse(row.new_data) : null
        });
      });
    } catch (error) {
      console.error('Error reading AUTH_FILE:', error.message);
      reject('Failed to read auth data: ' + error.message);
    }
  });
});

// In your main process file
ipcMain.handle('bulk-delete-user-history', async (event, timeframe) => {
  console.log('Bulk deleting user history for timeframe:', timeframe);
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
          console.error('Error bulk deleting user history:', err.message);
          reject(err.message);
          return;
        }
        
        console.log(`Bulk delete completed. ${this.changes} records deleted.`);
        resolve({ deletedCount: this.changes });
      });
    } catch (error) {
      console.error('Error in bulk delete operation:', error.message);
      reject('Failed to bulk delete history: ' + error.message);
    }
  });
});
