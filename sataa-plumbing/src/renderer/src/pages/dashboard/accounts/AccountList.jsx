import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await window.api.getAccounts();
        setAccounts(data || []);
        setFilteredAccounts(data || []);
      } catch (err) {
        setError('Failed to load accounts: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(account =>
        account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }
  }, [searchTerm, accounts]);

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-slate-900 text-lg font-semibold">Accounts</h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200 pl-10"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Link
            to="/dashboard/accounts/new"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Account
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <p className="text-rose-400">{error}</p>
        </div>
      )}
      
      {loading ? (
        <p className="text-slate-900">Loading accounts...</p>
      ) : filteredAccounts.length === 0 ? (
        <p className="text-slate-600">No accounts found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-slate-900 text-left border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-sm font-medium">ID</th>
                <th className="p-3 text-sm font-medium">Username</th>
                <th className="p-3 text-sm font-medium">Role</th>
                <th className="p-3 text-sm font-medium">Created At</th>
                <th className="p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
                  <td className="p-3">#{account.id}</td>
                  <td className="p-3">{account.username}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.role === 'admin' ? 'bg-indigo-600/10 text-indigo-600 border border-indigo-200' :
                      account.role === 'manager' ? 'bg-teal-500/10 text-teal-500 border border-teal-200' :
                      'bg-slate-500/10 text-slate-500 border border-slate-300'
                    }`}>
                      {formatRole(account.role)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link 
                      to={`/dashboard/accounts/${account.id}`}
                      className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AccountList;