import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function UserHistoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changedFields, setChangedFields] = useState(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await window.api.getAuthStatus();
        const role = await window.api.getUserRole();
        setIsAuthenticated(authStatus);
        setIsAdmin(role === 'admin');
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHistory = async () => {
      try {
        const record = await window.api.getUserHistoryById(Number(id));
        setHistory(record);
        
        // Calculate changed fields
        if (record.old_data && record.new_data) {
          const changes = new Set();
          
          // Check all keys in both old and new data
          const allKeys = new Set([
            ...Object.keys(record.old_data),
            ...Object.keys(record.new_data)
          ]);
          
          allKeys.forEach(key => {
            const oldValue = record.old_data[key];
            const newValue = record.new_data[key];
            
            // Handle different data types for comparison
            if (typeof oldValue !== typeof newValue) {
              changes.add(key);
            } else if (typeof oldValue === 'object' && oldValue !== null && newValue !== null) {
              // Compare objects by stringifying them
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.add(key);
              }
            } else if (oldValue !== newValue) {
              changes.add(key);
            }
          });
          
          setChangedFields(changes);
        }
      } catch (err) {
        setError('Failed to load history details: ' + (err.message || 'Unknown error'));
      }
    };
    fetchHistory();
  }, [isAuthenticated, id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;

    try {
      const result = await window.api.deleteUserHistory(Number(id));
      if (result > 0) {
        navigate('/dashboard/history', { state: { message: 'History record deleted successfully' } });
      } else {
        setError('Failed to delete: Record not found or not older than 7 days');
      }
    } catch (err) {
      setError('Failed to delete history: ' + (err.message || 'Unknown error'));
    }
  };

  // Helper function to format values for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-900">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-900">User not authenticated...</p>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 text-sm mb-4">{error || 'History record not found'}</p>
          <Link
            to="/dashboard/history"
            className="px-4 py-2 bg-indigo-500 text-slate-50 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm font-medium"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const isDeletable = new Date(history.created_at) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 text-xl font-semibold">User History Details</h3>
          <Link
            to="/dashboard/history"
            className="px-4 py-2 bg-indigo-500 text-slate-50 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm font-medium"
          >
            Back to History
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-md">
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h4 className="text-md font-semibold text-slate-900 mb-3">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Action:</strong> {history.action}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Table:</strong> {history.linked_action_table}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Linked Action ID:</strong> {history.linked_action_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  <strong>User:</strong> {history.username || 'Unknown'}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Date:</strong> {new Date(history.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Record ID:</strong> {id}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {(history.old_data || history.new_data) && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-slate-900 mb-4">Data Changes</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {history.old_data && (
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded mr-2">Old Data</span>
                    {changedFields.size > 0 && (
                      <span className="text-xs text-slate-500">
                        {changedFields.size} field(s) changed
                      </span>
                    )}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-slate-900 text-left border-collapse">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-3 text-xs font-semibold border-b border-slate-300">Field</th>
                          <th className="p-3 text-xs font-semibold border-b border-slate-300">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {Object.entries(history.old_data).map(([key, value]) => (
                          <tr 
                            key={key} 
                            className={changedFields.has(key) ? 'bg-amber-50' : ''}
                          >
                            <td className="p-3 text-xs font-medium">
                              {key}
                              {changedFields.has(key) && (
                                <span className="ml-1 text-rose-500">*</span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-slate-600 font-mono break-all">
                              {formatValue(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {history.new_data && (
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded mr-2">New Data</span>
                    {changedFields.size > 0 && (
                      <span className="text-xs text-slate-500">
                        {changedFields.size} field(s) changed
                      </span>
                    )}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-slate-900 text-left border-collapse">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-3 text-xs font-semibold border-b border-slate-300">Field</th>
                          <th className="p-3 text-xs font-semibold border-b border-slate-300">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {Object.entries(history.new_data).map(([key, value]) => (
                          <tr 
                            key={key} 
                            className={changedFields.has(key) ? 'bg-green-50' : ''}
                          >
                            <td className="p-3 text-xs font-medium">
                              {key}
                              {changedFields.has(key) && (
                                <span className="ml-1 text-green-500">*</span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-slate-600 font-mono break-all">
                              {formatValue(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {changedFields.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-slate-600">
                <p className="font-medium mb-1">Legend:</p>
                <ul className="list-disc list-inside">
                  <li>Fields marked with <span className="text-rose-500">*</span> have been changed</li>
                  <li>Old values are highlighted in <span className="bg-amber-50 px-1">amber</span></li>
                  <li>New values are highlighted in <span className="bg-green-50 px-1">green</span></li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        {(isAdmin || (history.account_id === Number(window.api.getAuthStatus()?.id))) && isDeletable && (
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 text-sm font-medium"
            >
              Delete History Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserHistoryDetails;