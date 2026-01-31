import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { API_BASE_URL } from '../services/api';

export default function Cart() {
  const { cart, addToCart, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] pb-20">
       <div className="text-6xl mb-4">🛒</div>
       <h2 className="text-xl font-bold text-gray-400">Your Cart is Empty</h2>
       <button onClick={() => navigate('/')} className="mt-6 text-primary font-bold underline">
         Start Shopping
       </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
      
      {/* List of Items */}
      <div className="p-4 space-y-4">
        {cart.map(item => (
          <div key={item._id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative">
            
            {/* Image (Yellow Bg style from screenshot) */}
            <div className="w-24 h-24 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
               <img 
                 src={`${API_BASE_URL}${item.images[0]}`} 
                 alt={item.name} 
                 className="w-20 h-20 object-contain drop-shadow-md"
               />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex justify-between items-start pr-8">
                   <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                </div>
                <p className="text-green-600 font-bold mt-1">₹{item.price}</p>
              </div>

              {/* Qty Controls */}
              <div className="flex items-center gap-4 bg-gray-50 w-fit rounded-lg px-2 py-1">
                <button 
                  onClick={() => addToCart(item, -1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold"
                >
                  <FiMinus size={14} />
                </button>
                <span className="font-bold text-gray-900">{item.qty}</span>
                <button 
                  onClick={() => addToCart(item, 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* Trash Icon (Top Right) */}
            <button 
              onClick={() => removeFromCart(item._id)}
              className="absolute top-3 right-3 text-red-500 bg-red-50 p-2 rounded-lg"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-[30px] shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-40">
        <div className="flex justify-between items-end mb-4">
           <span className="text-lg font-bold text-gray-900">Total Amount:</span>
           <span className="text-2xl font-extrabold text-green-600">₹{getCartTotal()}</span>
        </div>
        
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-[#FFD700] text-black font-extrabold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}