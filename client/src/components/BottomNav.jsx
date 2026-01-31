import { Link, useLocation } from 'react-router-dom';
import { FiMapPin, FiUser, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const { cart } = useCart();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 rounded-t-[35px] shadow-[0_-5px_30px_rgba(0,0,0,0.05)] z-50 flex justify-between items-center md:hidden">
      
      {/* Left Icons */}
      <div className="flex gap-8 text-gray-400">
        <Link to="/" className="text-black"><FiMapPin size={24} /></Link>
        <Link to="/admin"><FiUser size={24} /></Link>
        <Link to="/search"><FiSearch size={24} /></Link>
      </div>

      {/* Right Cart Pill */}
      <Link to="/cart" className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-bold flex items-center gap-3 shadow-md active:scale-95 transition-transform">
        <span>{cart.length} Goods</span>
        <FiShoppingCart size={20} />
      </Link>
    </div>
  );
}