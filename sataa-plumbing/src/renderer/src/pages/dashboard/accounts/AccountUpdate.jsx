import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AccountUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    role: 'staff',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' }
  ];

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accounts = await window.api.getAccounts();
        const account = accounts.find(a => a.id === Number(id));
        
        if (!account) {
          throw new Error('Account not found');
        }
        
        setFormData({
          username: account.username,
          role: account.role,
          newPassword: ''
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAccount();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        id: Number(id),
        username: formData.username,
        role: formData.role
      };
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      await window.api.updateAccount(updateData);
      navigate('/dashboard/accounts');
    } catch (err) {
      setError('Failed to update account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await window.api.deleteAccount(Number(id));
        navigate('/dashboard/accounts');
      } catch (err) {
        setError('Failed to delete account: ' + err.message);
      }
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Edit Account #{id}</h3>
        <button 
          onClick={() => navigate('/dashboard/accounts')}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
        >
          Back to List
        </button>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-600 text-sm font-medium">Username*</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          />
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            placeholder="Leave blank to keep current password"
            minLength="6"
          />
        </div>
        
        <div>
          <label className="text-slate-600 text-sm font-medium">Role*</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountUpdate;