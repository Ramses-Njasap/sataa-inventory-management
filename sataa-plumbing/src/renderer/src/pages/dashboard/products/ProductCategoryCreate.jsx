import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ProductCategoryCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_path: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [defaultImage, setDefaultImage] = useState('');

//   useEffect(() => {
//     const loadDefaultImage = async () => {
//       try {
//         const path = await window.api.getDefaultImage();
//         setDefaultImage(path);
//         setImagePreview(path);
//       } catch (err) {
//         console.error('Failed to load default image:', err);
//       }
//     };
//     loadDefaultImage();
//   }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

//   const handleImageUpload = async () => {
//     try {
//       const result = await window.api.openFileDialog();
      
//       if (!result.canceled && result.filePaths.length > 0) {
//         const filePath = result.filePaths[0];
        
//         // Create preview
//         const previewUrl = await window.api.getFileDataUrl(filePath);
//         setImagePreview(previewUrl);
        
//         // Upload the file
//         const imagePath = await window.api.uploadImage(filePath);
//         setFormData(prev => ({ ...prev, image_path: imagePath }));
//       }
//     } catch (err) {
//       setError('Failed to upload image: ' + (err.message || 'Unknown error'));
//     }
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      await window.api.addProductCategory({
        name: formData.name,
        description: formData.description || null,
        image_path: formData.image_path || null,
      });
      navigate('/dashboard/product-categories');
    } catch (err) {
      setError('Failed to create category: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Add Product Category</h3>
        <Link to="/dashboard/product-categories" className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline text-sm font-medium">
          Back to List
        </Link>
      </div>
      
      {error && (
        <p className="text-rose-400 text-sm mb-4">{error}</p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Category Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="text-slate-600 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
            rows="3"
          />
        </div>
        
        {/* Image Upload */}
        {/* <div>
          <label className="text-slate-600 text-sm font-medium">Category Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-300">
              <img 
                src={imagePreview}
                alt="Category preview" 
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
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductCategoryCreate;