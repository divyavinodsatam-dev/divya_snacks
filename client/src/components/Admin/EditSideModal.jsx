import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';
import { BASE_URL } from '../../services/api'; // Import BASE_URL to show existing images
import toast from 'react-hot-toast';

export default function EditSnackModal({ isOpen, onClose, snack, onSave, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    images: [] // New files to upload
  });

  // Load existing data
  useEffect(() => {
    if (snack) {
      setFormData({
        name: snack.name || '',
        price: snack.price || '',
        stock: snack.stock || '',
        description: snack.description || '',
        category: snack.category || '',
        images: [] 
      });
    } else {
      setFormData({ name: '', price: '', stock: '', description: '', category: '', images: [] });
    }
  }, [snack, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Multiple File Selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files); // Convert to Array
      if (files.length > 5) {
        toast.error("Max 5 images allowed");
        return;
      }
      setFormData(prev => ({ ...prev, images: files }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('description', formData.description);

    // ✅ Append each file with the SAME key 'images'
    formData.images.forEach((file) => {
      data.append('images', file);
    });
    
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
          
          {/* Inputs */}
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-3 rounded-xl" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold mb-1">Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-3 rounded-xl" required />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Stock</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-3 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-xl" required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-3 rounded-xl" />
          </div>

          {/* --- IMAGE SECTION --- */}
          <div>
             <label className="block text-sm font-bold mb-2">Images</label>
             
             {/* 1. Show Existing Images (if any) */}
             {snack && snack.images && snack.images.length > 0 && formData.images.length === 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                    {snack.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                            <img src={`${BASE_URL}${img}`} className="w-full h-full object-cover" alt="existing" />
                        </div>
                    ))}
                </div>
             )}

             {/* 2. Upload Box */}
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  multiple // ✅ Allows selecting multiple
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center gap-2">
                  <FiUpload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.images.length > 0 
                      ? `${formData.images.length} New Files Selected` 
                      : "Click to replace images (Select multiple at once)"}
                  </span>
                </div>
             </div>
             
             {/* 3. New Files Preview */}
             {formData.images.length > 0 && (
               <div className="mt-2 text-xs text-green-600 font-bold">
                 Uploading {formData.images.length} new images will replace old ones.
               </div>
             )}
          </div>

          <button type="submit" className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all mt-4">
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
}