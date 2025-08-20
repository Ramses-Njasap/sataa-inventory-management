import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minAvailable: '',
    maxAvailable: ''
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
    const fetchData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          window.api.getProducts(),
          window.api.getProductCategories(),
        ]);
        setProducts(productData || []);
        setFilteredProducts(productData || []);
        setCategories(categoryData || []);
      } catch (err) {
        setError('Failed to load data: ' + (err.message || 'Unknown error'));
      }
    };
    fetchData();
  }, []);

  // Apply filters when filters state changes
  useEffect(() => {
    let result = [...products];
    
    // Filter by product name
    if (filters.name) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    // Filter by category
    if (filters.category) {
      result = result.filter(product => 
        product.category_id === parseInt(filters.category)
      );
    }
    
    // Filter by price range
    if (filters.minPrice) {
      result = result.filter(product => 
        product.price_per_unit_sold >= parseFloat(filters.minPrice)
      );
    }
    
    if (filters.maxPrice) {
      result = result.filter(product => 
        product.price_per_unit_sold <= parseFloat(filters.maxPrice)
      );
    }
    
    // Filter by available quantity
    const availableQuantity = product => product.quantity_bought - product.quantity_sold;
    
    if (filters.minAvailable) {
      result = result.filter(product => 
        availableQuantity(product) >= parseInt(filters.minAvailable)
      );
    }
    
    if (filters.maxAvailable) {
      result = result.filter(product => 
        availableQuantity(product) <= parseInt(filters.maxAvailable)
      );
    }
    
    setFilteredProducts(result);
  }, [products, filters]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      // Special handling for available quantity
      if (key === 'available') {
        const availableA = a.quantity_bought - a.quantity_sold;
        const availableB = b.quantity_bought - b.quantity_sold;
        return direction === 'ascending' ? availableA - availableB : availableB - availableA;
      }
      
      // Special handling for category name
      if (key === 'category') {
        const categoryA = getCategory(a.category_id).name;
        const categoryB = getCategory(b.category_id).name;
        if (categoryA < categoryB) return direction === 'ascending' ? -1 : 1;
        if (categoryA > categoryB) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
      
      // Default sorting for other fields
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    
    setFilteredProducts(sortedProducts);
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
      category: '',
      minPrice: '',
      maxPrice: '',
      minAvailable: '',
      maxAvailable: ''
    });
  };

  const getCategory = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || { name: 'Unknown' };
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

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Products</h3>
        {isAdmin && (
          <Link
            to="/dashboard/products/new"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            Add Product
          </Link>
        )}
      </div>
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-slate-800">Filter Products</h4>
          <button 
            onClick={clearFilters}
            className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Name Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price Range (XAF)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
          
          {/* Available Quantity Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Available Quantity</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minAvailable"
                value={filters.minAvailable}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <input
                type="number"
                name="maxAvailable"
                value={filters.maxAvailable}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
      
      {error && (
        <p className="text-rose-400 text-sm mb-4">{error}</p>
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
                Product Name
                {sortConfig.key === 'name' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('category')}
              >
                Category Name
                {sortConfig.key === 'category' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('price_per_unit_sold')}
              >
                Price/Unit Sold
                {sortConfig.key === 'price_per_unit_sold' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-sm font-semibold border-b border-slate-300 cursor-pointer hover:bg-slate-200"
                onClick={() => handleSort('available')}
              >
                Available
                {sortConfig.key === 'available' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const category = getCategory(product.category_id);
                const available = product.quantity_bought - product.quantity_sold;
                
                return (
                  <tr key={product.id} className="hover:bg-slate-100 transition-colors duration-150">
                    <td className="p-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300 focus:ring-indigo-500" />
                    </td>
                    <td className="p-3 text-sm">
                      {product.name}
                    </td>
                    <td className="p-3 text-sm text-slate-600">{category.name}</td>
                    <td className="p-3 text-sm">{product.price_per_unit_sold.toFixed(2)} XAF</td>
                    <td className="p-3 text-sm">
                      <span className={available <= 5 ? "text-rose-600 font-medium" : ""}>
                        {available}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <Link to={`/dashboard/products/${product.id}`} className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline">
                        {isAdmin ? 'View & Edit' : 'View'}
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">
                  No products found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;