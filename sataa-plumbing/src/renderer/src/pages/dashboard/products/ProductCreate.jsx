import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ProductCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    image_path: '' 
  });
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    size: '',
    color: '#000000',
    price_per_unit_bought: '',
    price_per_unit_sold: '',
    quantity_bought: '',
    quantity_sold: '0',
    weight: '',
    weight_unit: '',
    total_price_bought: '',
    image_path: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [categoryImagePreview, setCategoryImagePreview] = useState('');

  const weightUnits = ['kg', 'g', 'mg', 'lb', 'oz'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await window.api.getProductCategories();
        setCategories(categoryData || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  // const handleCategoryImageUpload = async () => {
  //   try {
  //     const result = await window.api.openFileDialog();
      
  //     if (!result.canceled && result.filePaths.length > 0) {
  //       const filePath = result.filePaths[0];
        
  //       // Create preview
  //       const previewUrl = await window.api.getFileDataUrl(filePath);
  //       setCategoryImagePreview(previewUrl);
        
  //       // Upload the file
  //       const imagePath = await window.api.uploadImage(filePath);
  //       setCategoryForm(prev => ({ ...prev, image_path: imagePath }));
  //     }
  //   } catch (err) {
  //     setError('Failed to upload category image: ' + (err.message || 'Unknown error'));
  //   }
  // };

  // const handleProductImageUpload = async () => {
  //   try {
  //     const result = await window.api.openFileDialog();
      
  //     if (!result.canceled && result.filePaths.length > 0) {
  //       const filePath = result.filePaths[0];
        
  //       // Create preview
  //       const previewUrl = await window.api.getFileDataUrl(filePath);
  //       setImagePreview(previewUrl);
        
  //       // Upload the file and get the relative path
  //       const imagePath = await window.api.uploadImage(filePath);
        
  //       // Store the relative path in form data
  //       setFormData(prev => ({ 
  //         ...prev, 
  //         image_path: imagePath 
  //       }));
        
  //       console.log('Image uploaded successfully:', imagePath);
  //     }
  //   } catch (err) {
  //     console.error('Failed to upload product image:', err);
  //     setError('Failed to upload product image: ' + (err.message || 'Unknown error'));
  //   }
  // };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      const newCategoryId = await window.api.addProductCategory({
        name: categoryForm.name,
        description: categoryForm.description || null,
        image_path: categoryForm.image_path || null,
      });
      
      const newCategory = { 
        id: newCategoryId, 
        name: categoryForm.name, 
        description: categoryForm.description, 
        image_path: categoryForm.image_path 
      };
      
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category_id: String(newCategoryId) }));
      setCategoryForm({ name: '', description: '', image_path: '' });
      setCategoryImagePreview('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      setError('Failed to add category: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category_id) {
      setError('Category is required');
      return;
    }
    
    if (Number(formData.quantity_sold) > Number(formData.quantity_bought)) {
      setError('Quantity sold cannot exceed quantity bought');
      return;
    }
    
    const numericFields = [
      'price_per_unit_bought',
      'price_per_unit_sold',
      'quantity_bought',
      'quantity_sold',
      'weight',
      'total_price_bought'
    ];
    
    for (const field of numericFields) {
      if (Number(formData[field]) < 0) {
        setError('Negative values are not allowed');
        return;
      }
    }

    try {
      setLoading(true);
      await window.api.addProduct({
        category_id: Number(formData.category_id),
        name: formData.name,
        size: formData.size || null,
        color: formData.color || null,
        price_per_unit_bought: Number(formData.price_per_unit_bought),
        price_per_unit_sold: Number(formData.price_per_unit_sold),
        quantity_bought: Number(formData.quantity_bought),
        quantity_sold: Number(formData.quantity_sold),
        weight: formData.weight ? Number(formData.weight) : null,
        weight_unit: formData.weight_unit || null,
        total_price_bought: Number(formData.total_price_bought),
        image_path: formData.image_path || null,
      });
      navigate('/dashboard/products');
    } catch (err) {
      setError('Failed to create product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !categories.length) {
    return <div className="text-slate-900 p-6">Loading categories...</div>;
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Add Product</h3>
        <Link to="/dashboard/products" className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium">
          Back to List
        </Link>
      </div>
      
      {error && (
        <p className="text-rose-400 text-sm mb-4">{error}</p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          />
        </div>
        
        {/* Category */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="text-slate-600 text-sm font-medium">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="mt-6 px-2 py-1 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            +
          </button>
        </div>
        
        {/* Size */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Size</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
          />
        </div>
        
        {/* Color */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Color</label>
          <div className="flex items-center mt-1 space-x-2">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="h-10 w-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              name="color_text"
              value={formData.color}
              onChange={handleInputChange}
              className="flex-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        
        {/* Price/Unit Bought */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Price/Unit Bought</label>
          <input
            type="number"
            name="price_per_unit_bought"
            value={formData.price_per_unit_bought}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            min="0"
            step="0.01"
          />
        </div>
        
        {/* Price/Unit Sold */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Price/Unit Sold</label>
          <input
            type="number"
            name="price_per_unit_sold"
            value={formData.price_per_unit_sold}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            min="0"
            step="0.01"
          />
        </div>
        
        {/* Quantity Bought */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Quantity Bought</label>
          <input
            type="number"
            name="quantity_bought"
            value={formData.quantity_bought}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            min="0"
          />
        </div>
        
        {/* Quantity Sold */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Quantity Sold</label>
          <input
            type="number"
            name="quantity_sold"
            value={formData.quantity_sold}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            min="0"
            max={formData.quantity_bought}
          />
        </div>
        
        {/* Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-sm font-medium">Weight</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-slate-600 text-sm font-medium">Weight Unit</label>
            <select
              name="weight_unit"
              value={formData.weight_unit}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            >
              <option value="">Select Unit</option>
              {weightUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Total Price Bought */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Total Price Bought</label>
          <input
            type="number"
            name="total_price_bought"
            value={formData.total_price_bought}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
            min="0"
            step="0.01"
          />
        </div>
        
        {/* Product Image */}
        {/* <div>
          <label className="text-slate-600 text-sm font-medium">Product Image</label>
          <div className="mt-1 flex items-center space-x-4">
            {imagePreview && (
              <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-300">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'default-product.png';
                  }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleProductImageUpload}
              className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
            >
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
          {formData.image_path && (
            <p className="text-slate-600 text-xs mt-1">Image path: {formData.image_path}</p>
          )}
        </div> */}
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </form>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-900 text-lg font-semibold">Add New Category</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-slate-600 text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryInputChange}
                  className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  rows="3"
                />
              </div>
              
              {/* <div>
                <label className="text-slate-600 text-sm font-medium">Category Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  {categoryImagePreview && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-300">
                      <img 
                        src={categoryImagePreview} 
                        alt="Category preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'default-product.png';
                        }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCategoryImageUpload}
                    className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
                  >
                    {categoryImagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
                {categoryForm.image_path && (
                  <p className="text-slate-600 text-xs mt-1">Image path: {categoryForm.image_path}</p>
                )}
              </div> */}
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-500 text-slate-50 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCreate;