import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    description: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'ascending'
  });

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
    const fetchCategories = async () => {
      try {
        const categoryData = await window.api.getProductCategories();
        setCategories(categoryData || []);
        setFilteredCategories(categoryData || []);
      } catch (err) {
        setError('Failed to load categories: ' + (err.message || 'Unknown error'));
      }
    };
    fetchCategories();
  }, []);

  // Apply filters when filters state changes
  useEffect(() => {
    let result = [...categories];
    
    // Filter by category name
    if (filters.name) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    // Filter by description
    if (filters.description) {
      result = result.filter(category => 
        category.description && category.description.toLowerCase().includes(filters.description.toLowerCase())
      );
    }
    
    setFilteredCategories(result);
  }, [categories, filters]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    const sortedCategories = [...filteredCategories].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    
    setFilteredCategories(sortedCategories);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      description: ''
    });
  };

  if (loading && !categories) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-900">Checking authentication and loading product categories...</p>
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
        <h3 className="text-slate-900 text-lg font-semibold">Product Categories</h3>
        {isAdmin && (
          <Link
            to="/dashboard/product-categories/new"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            Add Category
          </Link>
        )}
      </div>
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-slate-800">Filter Categories</h4>
          <button 
            onClick={clearFilters}
            className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Name Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          {/* Description Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={filters.description}
              onChange={handleFilterChange}
              placeholder="Search in descriptions..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>
      
      {error && (
        <p className="text-rose-400 text-sm mb-4 animate-fade-in">{error}</p>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-slate-900 text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-sm font-semibold w-8 border-b border-slate-300">
                <input type="checkbox" className="rounded border-slate-300 focus:ring-indigo-500" />
              </th>
              <th 
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('name')}
              >
                Category Name
                {sortConfig.key === 'name' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('description')}
              >
                Description
                {sortConfig.key === 'description' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-100 transition-colors duration-150">
                  <td className="p-3 w-8">
                    <input type="checkbox" className="rounded border-slate-300 focus:ring-indigo-500" />
                  </td>
                  <td className="p-3 text-sm">
                    <Link to={`/dashboard/product-categories/${category.id}`} className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline">
                      {category.name}
                    </Link>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {category.description || (
                      <span className="text-slate-400 italic">No description</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <Link 
                      to={`/dashboard/product-categories/${category.id}`}
                      className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline mr-3"
                    >
                      {isAdmin ? 'View & Edit' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">
                  No categories found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductCategory;