import { Link } from 'react-router-dom';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function HeroCard({ item }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart(item, qty);
    toast.success(`Added ${qty} ${item.name}!`);
    setQty(1);
  };

  return (
    <div className="bg-[#FFD700] rounded-[40px] p-6 relative h-[420px] flex flex-col justify-between shadow-sm mx-4 md:mx-0">
      
      {/* Header: Name & Price */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h2 className="text-2xl font-bold text-black tracking-wide">{item.name}</h2>
          {/* Optional: Subtitle if you have it */}
          {/* <p className="text-black/60 font-medium">Spicy & Hot</p> */}
        </div>
        <span className="text-2xl font-bold text-black">₹{item.price}</span>
      </div>

      {/* Image (Centered & Floating) */}
      <Link to={`/snack/${item._id}`} className="absolute inset-0 flex items-center justify-center z-0 top-[-20px]">
        <img 
          src={`${BASE_URL}${item.images[0]}`} 
          alt={item.name} 
          className="w-56 h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Bottom Controls */}
      <div className="z-10 mt-auto">
        <div className="flex items-center justify-between mb-6 px-4">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black hover:bg-white transition-colors"
          >
            <FiMinus />
          </button>
          
          <span className="text-xl font-bold text-black">{qty} kg</span>
          
          <button 
            onClick={() => setQty(Math.min(item.stock, qty + 1))}
            className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black hover:bg-white transition-colors"
          >
            <FiPlus />
          </button>
        </div>

        <button 
          onClick={handleAddToCart}
          className="w-full bg-white text-black font-bold py-4 rounded-[20px] shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Add to card
        </button>
      </div>
    </div>
  );
}