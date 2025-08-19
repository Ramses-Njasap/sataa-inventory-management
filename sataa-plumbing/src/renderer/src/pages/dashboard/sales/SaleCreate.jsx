import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SaleCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
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
    const fetchData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          window.api.getCustomers(),
          window.api.getProducts()
        ]);
        setCustomers(customerData || []);
        setProducts(productData || []);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      }
    };
    fetchData();
  }, []);

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
      // Calculate total price from all cart items
      const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);
      
      // First create the sale
      const saleResult = await window.api.addSale({
        customer_id: selectedCustomer.id,
        total_price: totalPrice
      });

      // Then add all sale items
      for (const item of cart) {
        await window.api.addSaleItem({
          sale_id: saleResult.id,
          product_id: item.id,
          quantity: item.qty,
          price_per_unit: item.price,
          total_price: item.total
        });
      }

      navigate('/dashboard/sales');
    } catch (err) {
      setError('Failed to create sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">New Sale</h3>
        <button 
          onClick={() => navigate('/dashboard/sales')}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
        >
          Back to List
        </button>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="text-slate-600 text-sm font-medium">Customer*</label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === Number(e.target.value));
                setSelectedCustomer(customer || null);
              }}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
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
            className="mt-6 px-2 py-1 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            +
          </button>
        </div>

        {/* Product Selection */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Add Products</label>
          <select
            onChange={(e) => {
              const product = products.find(p => p.id === Number(e.target.value));
              if (product) addToCart(product);
              e.target.value = '';
            }}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
          >
            <option value="">Select Product</option>
            {products
              .filter(p => (p.quantity_bought - p.quantity_sold) > 0)
              .map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.price_per_unit_sold.toFixed(2)} XAF, 
                  Available: {product.quantity_bought - product.quantity_sold})
                </option>
              ))}
          </select>
        </div>

        {/* Cart Items */}
        {cart.length > 0 && (
          <div className="border-t border-slate-300 pt-4">
            <h4 className="text-slate-600 text-sm font-medium mb-2">
              Cart Items ({cart.length})
            </h4>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-slate-100 rounded-md">
                  <div className="flex-1">
                    <p className="text-slate-900 text-sm font-medium">{item.name}</p>
                    <p className="text-slate-600 text-sm">{item.price.toFixed(2)} XAF each</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={item.maxQty}
                    value={item.qty}
                    onChange={(e) => updateCartItem(index, 'qty', parseInt(e.target.value) || 1)}
                    className="w-16 p-1 bg-slate-50 text-slate-900 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-center transition-all duration-200"
                  />
                  <p className="w-20 text-right text-slate-900 text-sm font-medium">{item.total.toFixed(2)} XAF</p>
                  <button
                    type="button"
                    onClick={() => removeCartItem(index)}
                    className="text-rose-500 hover:text-rose-600 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-slate-300 text-right">
              <p className="text-slate-900 font-semibold">
                Total: {cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)} XAF
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading || !selectedCustomer || cart.length === 0}
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </form>

      {/* Customer Create Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-50">
          <div className="bg-slate-50 p-6 rounded-xl shadow-md border border-slate-300 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-900 text-lg font-semibold">New Customer</h3>
              <button 
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-slate-600 text-sm font-medium">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerInputChange}
                  className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm font-medium">Contact Info</label>
                <input
                  type="text"
                  name="contact_info"
                  value={customerForm.contact_info}
                  onChange={handleCustomerInputChange}
                  className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm font-medium">Address</label>
                <textarea
                  name="address"
                  value={customerForm.address}
                  onChange={handleCustomerInputChange}
                  className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 flex-1 text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-slate-500 text-slate-50 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 flex-1 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SaleCreate;