import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UserHistory() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ action: '', linked_action_table: '' });
  const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
        const result = await window.api.getUserHistory({ page: currentPage, pageSize });
        setHistory(result.history || []);
        setPagination(result.pagination || { totalRecords: 0, totalPages: 1 });
      } catch (err) {
        setError('Failed to load user history: ' + (err.message || 'Unknown error'));
      }
    };
    fetchHistory();
  }, [isAuthenticated, currentPage, pageSize]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleDelete = async (historyId) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;

    try {
      const result = await window.api.deleteUserHistory(historyId);
      if (result > 0) {
        setHistory((prev) => prev.filter((item) => item.id !== historyId));
        setPagination((prev) => ({
          ...prev,
          totalRecords: prev.totalRecords - 1,
          totalPages: Math.ceil((prev.totalRecords - 1) / pageSize)
        }));
        setSuccess('History record deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete: Record not found or not older than 7 days');
      }
    } catch (err) {
      setError('Failed to delete history: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTimeframe) {
      setError('Please select a timeframe for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete all history records ${getTimeframeText(selectedTimeframe)}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await window.api.bulkDeleteUserHistory(selectedTimeframe);
      if (result.deletedCount > 0) {
        setSuccess(`Successfully deleted ${result.deletedCount} history records ${getTimeframeText(selectedTimeframe)}`);
        
        // Refresh the history list
        const updatedResult = await window.api.getUserHistory({ page: currentPage, pageSize });
        setHistory(updatedResult.history || []);
        setPagination(updatedResult.pagination || { totalRecords: 0, totalPages: 1 });
        
        setSelectedTimeframe('');
        setShowBulkDelete(false);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('No records found for the selected timeframe or records are not old enough to be deleted');
      }
    } catch (err) {
      setError('Failed to delete history records: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getTimeframeText = (timeframe) => {
    const timeframeMap = {
      '7days': 'older than 7 days',
      '2weeks': 'older than 2 weeks',
      '3weeks': 'older than 3 weeks',
      '1month': 'older than 1 month',
      '2months': 'older than 2 months',
      '3months': 'older than 3 months'
    };
    return timeframeMap[timeframe] || '';
  };

  // Apply client-side filtering and sorting
  const filteredHistory = history.filter((item) => {
    return (
      (!filters.action || item.action.toLowerCase().includes(filters.action.toLowerCase())) &&
      (!filters.linked_action_table || item.linked_action_table.toLowerCase().includes(filters.linked_action_table.toLowerCase()))
    );
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const order = sort.order === 'asc' ? 1 : -1;
    if (sort.field === 'created_at') {
      return order * (new Date(a.created_at) - new Date(b.created_at));
    } else if (sort.field === 'action') {
      return order * a.action.localeCompare(b.action);
    }
    return 0;
  });

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

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">User History</h3>
        {isAdmin && (
          <button
            onClick={() => setShowBulkDelete(!showBulkDelete)}
            className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 text-sm font-medium"
          >
            Bulk Delete
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-100 border border-rose-200 text-rose-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {showBulkDelete && isAdmin && (
        <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
          <h4 className="text-md font-semibold text-slate-800 mb-3">Bulk Delete History Records</h4>
          <p className="text-sm text-slate-600 mb-3">
            Select a timeframe to delete all history records older than that period. 
            Records less than 7 days old cannot be deleted.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setSelectedTimeframe('7days')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '7days' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('2weeks')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '2weeks' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              2 Weeks
            </button>
            <button
              onClick={() => setSelectedTimeframe('3weeks')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '3weeks' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              3 Weeks
            </button>
            <button
              onClick={() => setSelectedTimeframe('1month')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '1month' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setSelectedTimeframe('2months')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '2months' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              2 Months
            </button>
            <button
              onClick={() => setSelectedTimeframe('3months')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTimeframe === '3months' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              3+ Months
            </button>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowBulkDelete(false);
                setSelectedTimeframe('');
              }}
              className="px-4 py-2 bg-slate-300 text-slate-700 rounded-md hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={!selectedTimeframe || isDeleting}
              className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 disabled:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium"
            >
              {isDeleting ? 'Deleting...' : 'Delete Records'}
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          placeholder="Filter by action..."
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="linked_action_table"
          value={filters.linked_action_table}
          onChange={handleFilterChange}
          placeholder="Filter by table..."
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-slate-900 text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-sm font-semibold w-8 border-b border-slate-300">
                <input type="checkbox" className="rounded border-slate-300 focus:ring-indigo-500" />
              </th>
              <th
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer"
                onClick={() => handleSortChange('action')}
              >
                Action {sort.field === 'action' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Table</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">User</th>
              <th
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer"
                onClick={() => handleSortChange('created_at')}
              >
                Date {sort.field === 'created_at' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {sortedHistory.map((record) => {
              const recordDate = new Date(record.created_at);
              const isDeletable = recordDate <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              
              return (
                <tr key={record.id} className="hover:bg-slate-100 transition-colors duration-150">
                  <td className="p-3 w-8">
                    <input type="checkbox" className="rounded border-slate-300 focus:ring-indigo-500" />
                  </td>
                  <td className="p-3 text-sm">{record.action}</td>
                  <td className="p-3 text-sm text-slate-600">{record.linked_action_table}</td>
                  <td className="p-3 text-sm text-slate-600">{record.username || 'Unknown'}</td>
                  <td className="p-3 text-sm">{recordDate.toLocaleString()}</td>
                  <td className="p-3 text-sm flex gap-2">
                    <Link
                      to={`/dashboard/history/${record.id}`}
                      className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                    >
                      View Details
                    </Link>
                    {(isAdmin || record.account_id === window.api.getAuthStatus()?.id) && isDeletable && (
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-rose-600 hover:text-rose-500 focus:outline-none focus:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-indigo-500 text-slate-50 rounded-md disabled:bg-slate-300 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm font-medium"
        >
          Previous
        </button>
        <span className="text-sm text-slate-900">
          Page {currentPage} of {pagination.totalPages} ({pagination.totalRecords} records)
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
          disabled={currentPage === pagination.totalPages}
          className="px-4 py-2 bg-indigo-500 text-slate-50 rounded-md disabled:bg-slate-300 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UserHistory;