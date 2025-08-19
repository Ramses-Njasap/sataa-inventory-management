import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SalesUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    total_price: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleData, customersData] = await Promise.all([
          window.api.getSales(),
          window.api.getCustomers()
        ]);
        
        const foundSale = saleData.find(s => s.id === Number(id));
        if (!foundSale) throw new Error('Sale not found');
        
        setSale(foundSale);
        setCustomers(customersData || []);
        setFormData({
          customer_id: foundSale.customer_id,
          total_price: foundSale.total_price
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await window.api.updateSale({
        id: Number(id),
        ...formData
      });
      navigate('/dashboard/sales');
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this sale?')) {
      try {
        await window.api.deleteSale(Number(id));
        navigate('/dashboard/sales');
      } catch (err) {
        setError('Failed to delete: ' + err.message);
      }
    }
  };

  if (!sale) return <div className="text-slate-900 p-6">Loading...</div>;

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Edit Sale #{sale.id}</h3>
        <button 
          onClick={() => navigate('/dashboard/sales')}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
        >
          Back to List
        </button>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-600 text-sm font-medium">Customer</label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          >
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">Total Price</label>
          <input
            type="number"
            name="total_price"
            value={formData.total_price}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            step="0.01"
            min="0"
            required
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

export default SalesUpdate;