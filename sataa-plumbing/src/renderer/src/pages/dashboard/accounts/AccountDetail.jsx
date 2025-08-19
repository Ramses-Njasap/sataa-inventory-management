import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accounts = await window.api.getAccounts();
        const foundAccount = accounts.find(a => a.id === Number(id));
        
        if (!foundAccount) {
          throw new Error('Account not found');
        }
        
        setAccount(foundAccount);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAccount();
  }, [id]);

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  if (!account) return <div className="text-slate-900 p-6">Loading...</div>;

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-slate-900 text-lg font-semibold">Account Details</h3>
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
          <button
            onClick={() => navigate(`/dashboard/accounts/${account.id}/edit`)}
            className="px-4 py-2 bg-indigo-600 text-slate-50 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Account
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <p className="text-rose-400">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-slate-900 text-left border-collapse">
          <tbody>
            <tr className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
              <td className="p-3 font-medium">ID</td>
              <td className="p-3">#{account.id}</td>
            </tr>
            <tr className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
              <td className="p-3 font-medium">Username</td>
              <td className="p-3">{account.username}</td>
            </tr>
            <tr className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
              <td className="p-3 font-medium">Role</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  account.role === 'admin' ? 'bg-indigo-600/10 text-indigo-600 border border-indigo-200' :
                  account.role === 'manager' ? 'bg-teal-500/10 text-teal-500 border border-teal-200' :
                  'bg-slate-500/10 text-slate-500 border border-slate-300'
                }`}>
                  {formatRole(account.role)}
                </span>
              </td>
            </tr>
            <tr className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
              <td className="p-3 font-medium">Created At</td>
              <td className="p-3">{new Date(account.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountDetail;