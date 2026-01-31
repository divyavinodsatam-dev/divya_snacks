import { useState, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditSnackModal({ isOpen, onClose, snack, onSave, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    images: []
  });

  // Load data when editing
  useEffect(() => {
    if (snack) {
      setFormData({
        name: snack.name || '',
        price: snack.price || '',
        stock: snack.stock || '',
        description: snack.description || '',
        category: snack.category || '',
        images: [] // Keep empty, we handle new files separately
      });
    } else {
      // Reset for "Add New"
      setFormData({ name: '', price: '', stock: '', description: '', category: '', images: [] });
    }
  }, [snack, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      return toast.error("Please fill required fields");
    }
    
    // Prepare FormData for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description);
    data.append('category', formData.category);
    
    // Append images
    formData.images.forEach((file) => {
      data.append('images', file);
    });
    
    // If editing, send the ID too (handled in parent)
    onSave(data, snack?._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{snack ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Laddu" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-bold mb-1">Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded-lg" required />
            </div>
            {/* Stock */}
            <div>
              <label className="block text-sm font-bold mb-1">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="0" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-1">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded-lg bg-white" required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border p-2 rounded-lg" placeholder="Ingredients, taste, weight..." />
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <FiUpload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {formData.images.length > 0 ? `${formData.images.length} files selected` : "Click to upload images"}
              </span>
            </label>
          </div>

          <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors mt-4">
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
} 