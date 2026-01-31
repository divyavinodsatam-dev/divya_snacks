import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiMenu, FiBell, FiShoppingCart } from 'react-icons/fi';
import { useState } from 'react';
// Import your logo image here
import logo_bg from '../assets/images/logo_bg.png'; 

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white px-4 py-4 md:py-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Left Side: Menu (Mobile) & Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-dark" onClick={() => setIsOpen(!isOpen)}>
            <FiMenu size={24} />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            {/* Replace with your actual Logo Image */}
            <img src={logo_bg} alt="Divyam Logo" className="h-10 w-auto" />
            {/* <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center font-bold text-sm">
              LOGO
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-dark leading-none">Divyam</h1>
              <span className="text-xs text-gray-500 font-medium">Swad Apulki Cha</span>
            </div> */}
          </Link>
        </div>

        {/* Right Side: Desktop Links & Icons */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/admin" className="hover:text-primary">Admin</Link>
          </div>

          {/* Icons */}
          <button className="text-dark relative">
            <FiBell size={24} />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-secondary border-2 border-white"></span>
          </button>
          
          <Link to="/cart" className="hidden md:flex relative text-dark">
            <FiShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-6 flex flex-col gap-4 z-40">
          <Link to="/" className="font-bold" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/admin" className="font-bold" onClick={() => setIsOpen(false)}>Admin</Link>
        </div>
      )}
    </nav>
  );
}