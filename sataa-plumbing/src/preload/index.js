import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'


const api = {
  // ==================== AUTHENTICATION ====================
  getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  logout: () => ipcRenderer.invoke('logout'),
  getUserRole: () => ipcRenderer.invoke('get-user-role'),

  // ==================== ACCOUNT MANAGEMENT ====================
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  updateAccount: (account) => ipcRenderer.invoke('update-account', account),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),

  // ==================== CUSTOMER MANAGEMENT ====================
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
  updateCustomer: (customer) => ipcRenderer.invoke('update-customer', customer),
  deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),

  // ==================== PRODUCT CATEGORY MANAGEMENT ====================
  getProductCategories: () => ipcRenderer.invoke('get-product-categories'),
  addProductCategory: (category) => ipcRenderer.invoke('add-product-category', category),
  updateProductCategory: (category) => ipcRenderer.invoke('update-product-category', category),
  deleteProductCategory: (id) => ipcRenderer.invoke('delete-product-category', id),

  // ==================== PRODUCT MANAGEMENT ====================
  getProducts: () => ipcRenderer.invoke('get-products'),
  getProductById: (id) => ipcRenderer.invoke('get-product-by-id', id),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),

  // ==================== SALES MANAGEMENT ====================
  getSales: () => ipcRenderer.invoke('get-sales'),
  getSaleById: (id) => ipcRenderer.invoke('get-sale-by-id', id),
  // addSale: (sale) => ipcRenderer.invoke('add-sale', sale),
  updateSale: (sale) => ipcRenderer.invoke('update-sale', sale),
  deleteSale: (id) => ipcRenderer.invoke('delete-sale', id),
  createSale: (saleData) => ipcRenderer.invoke('create-sale', saleData),
  // addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
  addSale: (saleData) => ipcRenderer.invoke('add-sale', saleData),
  getSalesByCustomer: (customerId) => ipcRenderer.invoke('get-sales-by-customer', customerId),

  // ==================== SALE ITEMS MANAGEMENT ====================
  getSaleItems: (saleId) => ipcRenderer.invoke('get-sale-items', saleId),
  getSaleItemById: (id) => ipcRenderer.invoke('get-sale-item-by-id', id),
  addSaleItem: (saleItem) => ipcRenderer.invoke('add-sale-item', saleItem),
  updateSaleItem: (saleItem) => ipcRenderer.invoke('update-sale-item', saleItem),
  deleteSaleItem: (id) => ipcRenderer.invoke('delete-sale-item', id),

  // ==================== IMAGE HANDLING ====================
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFileDataUrl: (filePath) => ipcRenderer.invoke('get-file-data-url', filePath),
  uploadImage: (filePath) => ipcRenderer.invoke('upload-image', filePath),
  getImageFullPath: (relativePath) => ipcRenderer.invoke('get-image-full-path', relativePath),
  getDefaultImage: () => ipcRenderer.invoke('get-default-image'),

  // ==================== FOR MAIN PRODUCT PAGE ====================

  finalizeSale: (saleData) => ipcRenderer.invoke('finalize-sale', saleData),
  printReceipt: (saleId, dataUrl) => ipcRenderer.invoke('print-receipt', saleId, dataUrl),
  getSaleWithItems: (saleId) => ipcRenderer.invoke('get-sale-with-items', saleId),
  updateSaleAndItems: (saleData) => ipcRenderer.invoke('update-sale-and-items', saleData),

  // ==================== Sales Analysis ====================
  getSalesStats: (startDate, endDate) => ipcRenderer.invoke('get-sales-stats', startDate, endDate),
  getRecentSales: (startDate, endDate, limit) => ipcRenderer.invoke('get-recent-sales', startDate, endDate, limit),
  getTopProducts: (startDate, endDate, limit) => ipcRenderer.invoke('get-top-products', startDate, endDate, limit),
  getSalesTrend: (startDate, endDate) => ipcRenderer.invoke('get-sales-trend', startDate, endDate),

  // ==================== User History ====================
  getUserHistory: (page, pageSize) => ipcRenderer.invoke('get-user-history', page, pageSize),
  deleteUserHistory: (id) => ipcRenderer.invoke('delete-user-history', id),
  getUserHistoryById: (id) => ipcRenderer.invoke('get-user-history-by-id', id),
  bulkDeleteUserHistory: (timeframe) => ipcRenderer.invoke('bulk-delete-user-history', timeframe),

  // ==================== UTILITIES ====================
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
