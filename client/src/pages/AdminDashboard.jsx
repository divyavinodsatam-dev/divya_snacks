import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEdit2, FiPlus, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  fetchSnacks, fetchCategories, fetchOrders,
  deleteSnack, addSnackWithImages, updateSnackWithImages,
  updateOrderStatus, addCategory, deleteCategory, BASE_URL
} from '../services/api';
import EditSnackModal from '../components/Admin/EditSidemodal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orders');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnack, setEditingSnack] = useState(null);
  const [newCatName, setNewCatName] = useState('');

  // 1. Auth Check & Data Loading
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
    } else {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Orders') {
        const data = await fetchOrders();
        setOrders(data);
      } else {
        const [sData, cData] = await Promise.all([fetchSnacks(), fetchCategories()]);
        setSnacks(sData);
        setCategories(cData);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleToggleAvailability = async (item) => {
    try {
      // Optimistic Update
      const updatedSnacks = snacks.map(s => 
        s._id === item._id ? { ...s, isAvailable: !s.isAvailable } : s
      );
      setSnacks(updatedSnacks);

      // API Call
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('price', item.price);
      formData.append('stock', item.stock);
      formData.append('category', item.category);
      formData.append('isAvailable', !item.isAvailable); // Flip status
      
      await updateSnackWithImages(item._id, formData);
      toast.success(item.isAvailable ? "Item Hidden" : "Item Live");
    } catch (e) {
      toast.error("Failed to update status");
      loadData(); // Revert on error
    }
  };

  const handleSaveSnack = async (formData, id) => {
    try {
      if (id) {
        await updateSnackWithImages(id, formData);
        toast.success("Item Updated");
      } else {
        await addSnackWithImages(formData);
        toast.success("Item Added");
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const handleDeleteSnack = async (id) => {
    if (confirm("Delete this item?")) {
      await deleteSnack(id);
      loadData();
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await addCategory(newCatName);
      setNewCatName('');
      loadData();
      toast.success("Category Added");
    } catch (e) { toast.error("Failed"); }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Delete category?")) {
        await deleteCategory(id);
        loadData();
    }
  };

  const handleStatusUpdate = async (id, status) => {
    await updateOrderStatus(id, status);
    loadData();
    toast.success("Order Updated");
  };

  // --- RENDERERS ---

  const ToggleSwitch = ({ active, onClick }) => (
    <button 
      onClick={onClick} 
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-blue-500' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* 1. HEADER (Orange) */}
      <div className="bg-[#FF5722] px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <Link to="/" className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-white text-xl font-bold tracking-wide">Dashboard</h1>
      </div>

      {/* 2. TABS (White strip) */}
      <div className="bg-white flex shadow-sm sticky top-[72px] z-10">
        {['Orders', 'Menu', 'Categories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-4 transition-colors ${
              activeTab === tab 
                ? 'border-[#FFD700] text-gray-900' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* --- ORDERS TAB --- */}
            {activeTab === 'Orders' && (
              <div className="flex flex-col gap-4">
                {orders.length === 0 ? (
                  <div className="text-center py-40 text-gray-400 text-lg">No Pending Orders</div>
                ) : (
                  orders.map(order => (
                    <div key={order._id} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-lg">{order.customerName}</h3>
                         <span className={`px-2 py-0.5 text-xs rounded font-bold ${order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status}
                         </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">Phone: {order.customerPhone}</p>
                      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                        {order.items.map((i, idx) => (
                           <div key={idx} className="flex justify-between">
                              <span>{i.quantity} x {i.snackName}</span>
                              <span className="font-medium">₹{i.price * i.quantity}</span>
                           </div>
                        ))}
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                           <span>Total</span>
                           <span>₹{order.totalAmount}</span>
                        </div>
                      </div>
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                          className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600"
                        >
                          <FiCheck /> Confirm Order
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* --- MENU TAB --- */}
            {activeTab === 'Menu' && (
              <div className="space-y-4 pb-16">
                {snacks.map(item => (
                  <div key={item._id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-4">
                    
                    {/* Thumbnail */}
                    <img 
                      src={`${BASE_URL}${item.images[0]}`} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100" 
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Stock: {item.stock}</p>
                      <p className="text-green-600 font-bold mt-1">₹{item.price}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 mb-1">
                           {item.isAvailable ? 'Live' : 'Hidden'}
                        </span>
                        <ToggleSwitch active={item.isAvailable} onClick={() => handleToggleAvailability(item)} />
                      </div>
                      
                      <div className="flex gap-4 pr-1">
                        <button onClick={() => { setEditingSnack(item); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                           <FiEdit2 size={20} />
                        </button>
                        <button onClick={() => handleDeleteSnack(item._id)} className="text-red-500 hover:text-red-700">
                           <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- CATEGORIES TAB --- */}
            {activeTab === 'Categories' && (
              <div className="space-y-4">
                {/* Input Card */}
                <div className="bg-white p-2 rounded-lg shadow-sm flex gap-2">
                  <input 
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New Category Name"
                    className="flex-1 bg-gray-50 rounded-md px-3 py-2 text-sm outline-none border border-transparent focus:border-yellow-400"
                  />
                  <button 
                    onClick={handleAddCategory}
                    className="bg-[#FFD700] text-black font-bold px-4 rounded-md text-sm shadow-sm"
                  >
                    Add
                  </button>
                </div>

                {/* List */}
                <div className="space-y-2">
                   {categories.map(cat => (
                     <div key={cat._id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 p-1">
                           <FiTrash2 size={20} />
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FLOATING ADD BUTTON (Only on Menu Tab) */}
      {activeTab === 'Menu' && (
        <button 
          onClick={() => { setEditingSnack(null); setIsModalOpen(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#FFD700] rounded-full shadow-lg flex items-center justify-center text-white text-3xl z-30 hover:scale-105 transition-transform"
        >
          <FiPlus strokeWidth={3} />
        </button>
      )}

      {/* Edit Modal Component */}
      <EditSnackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        snack={editingSnack}
        categories={categories}
        onSave={handleSaveSnack}
      />
    </div>
  );
}