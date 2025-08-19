import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AccountCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' // default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'salesperson', label: 'Sales Person' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await window.api.addAccount({
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard/accounts');
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-slate-900 text-lg font-semibold">Create Account</h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/accounts"
            className="px-4 py-2 bg-slate-200 text-slate-900 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <p className="text-rose-400">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-900 text-sm font-medium">Username*</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          />
        </div>
        
        <div>
          <label className="text-slate-900 text-sm font-medium">Password*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            minLength="6"
          />
        </div>
        
        <div>
          <label className="text-slate-900 text-sm font-medium">Role*</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center disabled:opacity-50"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountCreate;