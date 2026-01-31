import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { fetchSnacks, BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SnackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [snack, setSnack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0); // For Image Gallery

  useEffect(() => {
    const load = async () => {
      try {
        const allSnacks = await fetchSnacks();
        const found = allSnacks.find(s => s._id === id);
        setSnack(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!snack) return <div className="text-center p-10">Item not found</div>;

  // Handles images safely
  const images = snack.images && snack.images.length > 0 ? snack.images : [];
  const activeImage = images.length > 0 ? `${BASE_URL}${images[activeImgIndex]}` : 'https://placehold.co/400?text=No+Image';

  const handleAddToCart = () => {
    addToCart(snack, qty);
    toast.success(`Added ${qty} ${snack.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* 1. Header with Back Button */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="bg-white/80 p-3 rounded-full shadow-sm backdrop-blur-md text-black">
          <FiArrowLeft size={24} />
        </button>
      </div>

      {/* 2. Image Gallery Section */}
      <div className="bg-[#FFF8E1] h-[50vh] relative rounded-b-[50px] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Main Active Image */}
        <img 
          src={activeImage} 
          alt={snack.name} 
          className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl transition-all duration-300"
        />

        {/* Thumbnail Dots/Images (If more than 1 image) */}
        {images.length > 1 && (
          <div className="absolute bottom-6 flex gap-3 z-20 overflow-x-auto px-4 w-full justify-center">
            {images.map((img, index) => (
              <button 
                key={index} 
                onClick={() => setActiveImgIndex(index)}
                className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${
                  activeImgIndex === index ? 'border-orange-500 scale-110' : 'border-transparent opacity-60'
                }`}
              >
                <img src={`${BASE_URL}${img}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Details Section */}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900">{snack.name}</h1>
          <span className="text-2xl font-bold text-green-600">₹{snack.price}</span>
        </div>
        
        <p className="text-gray-500 font-medium mb-6">{snack.category}</p>

        <p className="text-gray-600 leading-relaxed mb-8">
          {snack.description || "A delicious snack made with fresh ingredients. Perfect for your cravings!"}
        </p>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-black"
            >
              <FiMinus />
            </button>
            <span className="text-xl font-bold">{qty}</span>
            <button 
              onClick={() => setQty(Math.min(snack.stock || 20, qty + 1))}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-black"
            >
              <FiPlus />
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-[#FFD700] text-black font-extrabold py-4 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Add to Cart <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}