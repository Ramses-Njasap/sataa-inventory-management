import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SaleItemUpdate() {
  const { saleId, itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    price_per_unit: '',
    discount_per_unit: 0,
    total_price: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, productsData] = await Promise.all([
          window.api.getSaleItems(saleId),
          window.api.getProducts()
        ]);
        
        const foundItem = itemsData.find(i => i.id === Number(itemId));
        if (!foundItem) throw new Error('Item not found');
        
        setItem(foundItem);
        setProducts(productsData || []);
        setFormData({
          product_id: foundItem.product_id,
          quantity: foundItem.quantity,
          price_per_unit: foundItem.price_per_unit,
          discount_per_unit: foundItem.discount_per_unit,
          total_price: foundItem.total_price
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [saleId, itemId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Calculate total if quantity or price changes
    if (name === 'quantity' || name === 'price_per_unit' || name === 'discount_per_unit') {
      const qty = name === 'quantity' ? Number(value) : Number(newFormData.quantity);
      const price = name === 'price_per_unit' ? Number(value) : Number(newFormData.price_per_unit);
      const discount = name === 'discount_per_unit' ? Number(value) : Number(newFormData.discount_per_unit);
      
      newFormData.total_price = (qty * (price - discount)).toFixed(2);
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await window.api.updateSaleItem({
        id: Number(itemId),
        sale_id: Number(saleId),
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        discount_per_unit: Number(formData.discount_per_unit),
        total_price: Number(formData.total_price)
      });
      navigate(`/dashboard/sales/${saleId}/items`);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this item?')) {
      try {
        await window.api.deleteSaleItem(Number(itemId));
        navigate(`/dashboard/sales/${saleId}/items`);
      } catch (err) {
        setError('Failed to delete: ' + err.message);
      }
    }
  };

  if (!item) return <div className="text-slate-900 p-6">Loading...</div>;

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Edit Sale Item</h3>
        <button 
          onClick={() => navigate(`/dashboard/sales/${saleId}/items`)}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
        >
          Back to Items
        </button>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-600 text-sm font-medium">Product</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.price_per_unit_sold.toFixed(2)} XAF)
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-slate-600 text-sm font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="text-slate-600 text-sm font-medium">Unit Price</label>
            <input
              type="number"
              name="price_per_unit"
              min="0"
              step="0.01"
              value={formData.price_per_unit}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="text-slate-600 text-sm font-medium">Discount/Unit</label>
            <input
              type="number"
              name="discount_per_unit"
              min="0"
              step="0.01"
              value={formData.discount_per_unit}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">Total Price</label>
          <input
            type="number"
            name="total_price"
            value={formData.total_price}
            readOnly
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200 opacity-75"
          />
        </div>
        
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default SaleItemUpdate;