import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CustomerUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_info: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await window.api.getCustomers();
        const foundCustomer = data.find(c => c.id === Number(id));
        if (!foundCustomer) throw new Error('Customer not found');
        
        setCustomer(foundCustomer);
        setFormData({
          name: foundCustomer.name,
          contact_info: foundCustomer.contact_info || '',
          address: foundCustomer.address || ''
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await window.api.updateCustomer({
        id: Number(id),
        ...formData
      });
      navigate('/dashboard/customers');
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this customer?')) {
      try {
        await window.api.deleteCustomer(Number(id));
        navigate('/dashboard/customers');
      } catch (err) {
        setError('Failed to delete: ' + err.message);
      }
    }
  };

  if (!customer) return <div className="text-slate-900 p-6">Loading...</div>;

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Edit Customer</h3>
        <button 
          onClick={() => navigate('/dashboard/customers')}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
        >
          Back to List
        </button>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-600 text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          />
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">Contact Info</label>
          <input
            type="text"
            name="contact_info"
            value={formData.contact_info}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            rows="3"
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

export default CustomerUpdate;