import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await window.api.getProductCategories();
        setCategories(categoryData || []);
      } catch (err) {
        setError('Failed to load categories: ' + (err.message || 'Unknown error'));
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Product Categories</h3>
        <Link
          to="/dashboard/product-categories/new"
          className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
        >
          Add Category
        </Link>
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
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Category Name</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Description</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {categories.map((category) => (
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
                  {category.description || 'No description'}
                </td>
                <td className="p-3 text-sm">
                  <Link 
                    to={`/dashboard/product-categories/${category.id}`}
                    className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline mr-3"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductCategory;