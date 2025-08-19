import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [defaultImage, setDefaultImage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    size: '',
    color: '#000000',
    price_per_unit_bought: '',
    price_per_unit_sold: '',
    quantity_bought: '',
    quantity_sold: '',
    weight: '',
    weight_unit: 'kg',
    total_price_bought: '',
    image_path: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const imagePathRef = useRef('');

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const allowedNegativeFields = ['price_per_unit_bought', 'price_per_unit_sold', 'total_price_bought'];

  // Load default image path on component mount
  // useEffect(() => {
  //   const loadDefaultImage = async () => {
  //     try {
  //       const path = await window.api.getDefaultImage();
  //       setDefaultImage(path);
  //     } catch (err) {
  //       console.error('Failed to load default image:', err);
  //     }
  //   };
  //   loadDefaultImage();
  // }, []);

  // const loadImagePreview = useCallback(async (imagePath) => {
  //   if (!imagePath) {
  //     setImagePreview(defaultImage);
  //     return;
  //   }

  //   if (imagePathRef.current === imagePath) return;
    
  //   // Clean up previous blob URL if exists
  //   if (imagePreview.startsWith('blob:')) {
  //     URL.revokeObjectURL(imagePreview);
  //   }

  //   imagePathRef.current = imagePath;

  //   try {
  //     if (imagePath.startsWith('blob:') || imagePath.startsWith('file:')) {
  //       setImagePreview(imagePath);
  //       return;
  //     }

  //     if (imagePath === 'default-product.png') {
  //       setImagePreview(defaultImage);
  //       return;
  //     }

  //     const fullImagePath = await window.api.getImageFullPath(imagePath);
  //     setImagePreview(`file://${fullImagePath}`);
  //   } catch (err) {
  //     console.error('Error loading image:', err);
  //     setImagePreview(defaultImage);
  //   }
  // }, [imagePreview, defaultImage]);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([
        window.api.getProductById(Number(id)),
        window.api.getProductCategories(),
      ]);
      
      setProduct(productData);
      setCategories(categoryData);
      
      const newFormData = {
        name: productData.name || '',
        category_id: productData.category_id || '',
        size: productData.size || '',
        color: productData.color || '#000000',
        price_per_unit_bought: productData.price_per_unit_bought || '',
        price_per_unit_sold: productData.price_per_unit_sold || '',
        quantity_bought: productData.quantity_bought || '',
        quantity_sold: productData.quantity_sold || '',
        weight: productData.weight || '',
        weight_unit: productData.weight_unit || 'kg',
        total_price_bought: productData.total_price_bought || '',
        image_path: productData.image_path || '',
      };
      
      setFormData(newFormData);

      // if (productData.image_path) {
      //   await loadImagePreview(productData.image_path);
      // } else {
      //   setImagePreview(defaultImage);
      // }
    } catch (err) {
      setError('Failed to load product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id, defaultImage]);

  useEffect(() => {
    fetchProductData();

    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [fetchProductData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e) => {
    setFormData(prev => ({ ...prev, color: e.target.value }));
  };

  // const handleImageUpload = async () => {
  //   try {
  //     setError('');
  //     const result = await window.api.openFileDialog();
      
  //     if (!result.canceled && result.filePaths.length > 0) {
  //       const filePath = result.filePaths[0];
        
  //       // Create preview
  //       const previewUrl = await window.api.getFileDataUrl(filePath);
  //       await loadImagePreview(previewUrl);
        
  //       // Upload the file
  //       const imagePath = await window.api.uploadImage(filePath);
  //       setFormData(prev => ({ ...prev, image_path: imagePath }));
  //     }
  //   } catch (err) {
  //     console.error('Upload error:', err);
  //     setError('Failed to upload image: ' + (err.message || 'Unknown error'));
  //   }
  // };

  const validateForm = () => {
    if (Number(formData.quantity_sold) > Number(formData.quantity_bought)) {
      setError('Quantity sold cannot be greater than quantity bought');
      return false;
    }

    const invalidFields = Object.entries(formData)
      .filter(([key, value]) => {
        if (allowedNegativeFields.includes(key)) return false;
        const numValue = Number(value);
        return !isNaN(numValue) && numValue < 0;
      });

    if (invalidFields.length > 0) {
      setError(`Negative values not allowed for: ${invalidFields.map(([key]) => key).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      await window.api.updateProduct({
        id: Number(id),
        ...formData,
        category_id: Number(formData.category_id),
        price_per_unit_bought: Number(formData.price_per_unit_bought),
        price_per_unit_sold: Number(formData.price_per_unit_sold),
        quantity_bought: Number(formData.quantity_bought),
        quantity_sold: Number(formData.quantity_sold),
        weight: formData.weight ? Number(formData.weight) : null,
        weight_unit: formData.weight ? formData.weight_unit : null,
        total_price_bought: Number(formData.total_price_bought),
      });
      navigate('/dashboard/products');
    } catch (err) {
      setError('Failed to update product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await window.api.deleteProduct(Number(id));
        navigate('/dashboard/products');
      } catch (err) {
        setError('Failed to delete product: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !product) {
    return <div className="text-slate-900 p-6">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="text-slate-900 p-6">
        <p className="text-rose-400">Failed to load product</p>
        <button 
          onClick={() => navigate('/dashboard/products')}
          className="mt-4 px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Edit Product: {product.name}</h3>
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
        <div>
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
        
        {/* Color Picker */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Color</label>
          <div className="flex items-center mt-1 space-x-2">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleColorChange}
              className="h-10 w-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              name="color_text"
              value={formData.color}
              onChange={handleColorChange}
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
            min="0"
            required
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
            min="0"
            max={formData.quantity_bought}
            required
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
            step="0.01"
          />
        </div>
        
        {/* Image Upload */}
        {/* <div>
          <label className="text-slate-600 text-sm font-medium">Product Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-300">
              <img 
                src={imagePreview}
                alt="Product preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleImageUpload}
              className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
              disabled={loading}
            >
              {formData.image_path ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
        </div> */}
        
        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-500 text-slate-50 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductDetail;