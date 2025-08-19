import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          window.api.getProducts(),
          window.api.getProductCategories(),
        ]);
        setProducts(productData);
        setCategories(categoryData);
      } catch (err) {
        setError('Failed to load data: ' + (err.message || 'Unknown error'));
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Initiating logout'); // Debug log
      await window.api.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getCategory = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || { name: 'Unknown', image_path: null };
  };

  const calculateDiscount = (bought, sold) => {
    if (bought <= 0) return '0%';
    const discount = ((sold - bought) / bought * 100).toFixed(1);
    return `${discount}%`;
  };

  const getDiscountColor = (discount) => {
    const value = parseFloat(discount);
    if (value > 0) return 'text-emerald-600 bg-emerald-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getStockStatus = (available) => {
    if (available <= 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (available <= 5) return { text: `${available} Left`, color: 'text-amber-600 bg-amber-50' };
    return { text: `${available} Available`, color: 'text-emerald-600 bg-emerald-50' };
  };

  const handleSell = (product) => {
    setSelectedProduct(product);
    setIsSaleModalOpen(true);
  };

  const handleCreateSale = (saleData) => {
    // Navigate to checkout page with the sale data
    navigate('/sales/checkout', { state: { saleData } });
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toString().includes(searchTerm);
      const matchesCategory = selectedCategory ? product.category_id === parseInt(selectedCategory) : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch(sortOption) {
        case 'name': return a.name.localeCompare(b.name);
        case 'id': return a.id - b.id;
        case 'price': return a.price_per_unit_sold - b.price_per_unit_sold;
        case 'stock': return (a.quantity_bought - a.quantity_sold) - (b.quantity_bought - b.quantity_sold);
        default: return 0;
      }
    });
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Products Inventory</h1>
              <p className="text-slate-600">Manage your product catalog and track inventory levels</p>
            </div>
            <div className='flex flex-row flex-wrap gap-4'>
              <button
                onClick={() => setIsSaleModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Sale
              </button>
              <button
                onClick={() => handleLogout()}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <span className="text-sm font-medium text-slate-600">Total Products: </span>
              <span className="text-lg font-bold text-slate-800">{products.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <span className="text-sm font-medium text-slate-600">Categories: </span>
              <span className="text-lg font-bold text-slate-800">{categories.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="id">ID</option>
                <option value="price">Price (Low to High)</option>
                <option value="stock">Stock (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pricing</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Inventory</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const category = getCategory(product.category_id);
                  const available = product.quantity_bought - product.quantity_sold;
                  const stockStatus = getStockStatus(available);
                  const discount = calculateDiscount(product.price_per_unit_bought, product.price_per_unit_sold);
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-200">
                      {/* ID */}
                      <td className="px-4 py-4 text-sm font-medium text-slate-800">
                        #{product.id}
                      </td>
                      
                      {/* Category */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* {category.image_path ? (
                            <img
                              src={category.image_path}
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-xl shadow-sm border border-slate-200"
                              onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center shadow-sm">
                              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )} */}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{category.name}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Product */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* {product.image_path ? (
                            <img
                              src={`app://./${product.image_path}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl shadow-sm border border-slate-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                window.api.getDefaultImage().then((src) => {
                                  e.target.src = src;
                                });
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl flex items-center justify-center shadow-sm">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )} */}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Details */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {product.size && (
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                              Size: {product.size}
                            </span>
                          )}
                          {product.color && (
                            <span
                              className="inline-block px-2 py-1 h-5 w-5 rounded-lg ml-1"
                              style={{ backgroundColor: product.color }}
                            >
                            </span>
                          )}
                          {product.weight && (
                            <div className="text-xs text-slate-500 mt-1">
                              Weight: {product.weight.toFixed(2)} {product.weight_unit || 'units'}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Pricing */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Buy:</span>
                            <span className="text-sm font-medium text-slate-800">{product.price_per_unit_bought.toFixed(2)} XAF</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Sell:</span>
                            <span className="text-sm font-medium text-slate-800">{product.price_per_unit_sold.toFixed(2)} XAF</span>
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${getDiscountColor(discount)}`}>
                            {discount}
                          </span>
                          <div className="text-xs text-slate-500">
                            Total: {product.total_price_bought.toFixed(2)} XAF
                          </div>
                        </div>
                      </td>
                      
                      {/* Inventory */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Bought:</span>
                            <span className="text-sm font-medium text-slate-800">{product.quantity_bought}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Sold:</span>
                            <span className="text-sm font-medium text-slate-800">{product.quantity_sold}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Available:</span>
                            <span className="text-sm font-medium text-slate-800">{available}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      
                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleSell(product)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-sm disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
                          disabled={available <= 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {filteredProducts.length === 0 && !error && (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Modal */}
      {isSaleModalOpen && (
        <SaleModal
          selectedProduct={selectedProduct}
          products={products}
          onClose={() => setIsSaleModalOpen(false)}
          onCreateSale={handleCreateSale}
        />
      )}
    </div>
  );
}

// Sale Modal Component
function SaleModal({ selectedProduct, products, onClose, onCreateSale }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contact_info: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerData = await window.api.getCustomers();
        setCustomers(customerData || []);
      } catch (err) {
        setError('Failed to load customers: ' + err.message);
      }
    };
    fetchCustomers();

    // Initialize cart if a product is selected
    if (selectedProduct) {
      const available = selectedProduct.quantity_bought - selectedProduct.quantity_sold;
      if (available > 0) {
        setCart([{
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price_per_unit_sold,
          qty: 1,
          total: selectedProduct.price_per_unit_sold,
          maxQty: available
        }]);
      }
    }
  }, [selectedProduct]);

  const addToCart = (product) => {
    const available = product.quantity_bought - product.quantity_sold;
    if (available <= 0) {
      setError('This product is out of stock');
      return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      updateCartItem(existingItemIndex, 'qty', cart[existingItemIndex].qty + 1);
    } else {
      setCart(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price_per_unit_sold,
        qty: 1,
        total: product.price_per_unit_sold,
        maxQty: available
      }]);
    }
  };

  const updateCartItem = (index, field, value) => {
    const newCart = [...cart];
    let newValue = value;
    
    if (field === 'qty') {
      newValue = Math.min(Math.max(1, parseInt(value) || 1), newCart[index].maxQty);
    }
    
    newCart[index] = {
      ...newCart[index],
      [field]: newValue,
      total: field === 'qty' ? newValue * newCart[index].price : newCart[index].total
    };
    setCart(newCart);
  };

  const removeCartItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name) {
      setError('Customer name is required');
      return;
    }

    try {
      setLoading(true);
      const newCustomer = await window.api.addCustomer({
        name: customerForm.name,
        contact_info: customerForm.contact_info,
        address: customerForm.address
      });
      
      setCustomers(prev => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer);
      setCustomerForm({ name: '', contact_info: '', address: '' });
      setIsCustomerModalOpen(false);
    } catch (err) {
      setError('Failed to add customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (cart.length === 0) {
      setError('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);
      
      const saleData = {
        customer_id: selectedCustomer.id,
        total_price: totalPrice,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          price_per_unit: item.price,
          total_price: item.total
        }))
      };

      onCreateSale(saleData);
      onClose();
    } catch (err) {
      setError('Failed to create sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedProduct ? 'Sell Product' : 'New Sale'}
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer*</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === Number(e.target.value));
                    setSelectedCustomer(customer || null);
                  }}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                Add New
              </button>
            </div>

            {/* Product Selection */}
            {!selectedProduct && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Products</label>
                <select
                  onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    if (product) addToCart(product);
                    e.target.value = '';
                  }}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Product</option>
                  {products
                    .filter(p => (p.quantity_bought - p.quantity_sold) > 0)
                    .map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.price_per_unit_sold.toFixed(2)} XAF), 
                        Available: {product.quantity_bought - product.quantity_sold}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Cart Items */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-medium text-slate-800 mb-4">
                  Cart Items ({cart.length})
                </h3>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.price.toFixed(2)} XAF each</p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={item.maxQty}
                        value={item.qty}
                        onChange={(e) => updateCartItem(index, 'qty', parseInt(e.target.value) || 1)}
                        className="w-20 p-2 border border-slate-300 rounded-lg text-center"
                      />
                      <p className="w-24 text-right font-medium">{item.total.toFixed(2)} XAF</p>
                      <button
                        type="button"
                        onClick={() => removeCartItem(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-right">
                  <p className="text-xl font-bold text-slate-800">
                    Total: {cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)} XAF
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || !selectedCustomer || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Customer Create Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">New Customer</h3>
              <button 
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Info</label>
                <input
                  type="text"
                  name="contact_info"
                  value={customerForm.contact_info}
                  onChange={handleCustomerInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={customerForm.address}
                  onChange={handleCustomerInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;