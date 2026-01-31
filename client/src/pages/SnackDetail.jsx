import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchSnacks } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { BASE_URL } from '../services/api';

export default function SnackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [snack, setSnack] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnacks().then(data => {
      setSnack(data.find(s => s._id === id));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!snack) return <div className="text-center py-20">Item not found</div>;

  const handleAddToCart = () => {
    addToCart(snack, qty);
    toast.success(`${qty} x ${snack.name} added!`);
    navigate('/');
  };

  const isSoldOut = snack.stock === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-dark">
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Image */}
        <div className="bg-white rounded-3xl p-8 shadow-sm flex items-center justify-center">
          <img 
            src={`${BASE_URL}${snack.images[0]}`} 
            alt={snack.name} 
            className="w-full max-h-[400px] object-contain"
          />
        </div>

        {/* Content */}
        <div>
          <span className="text-gray-400 uppercase tracking-wide text-sm font-semibold">{snack.category}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2 mb-4">{snack.name}</h1>
          <p className="text-3xl font-bold text-secondary mb-6">₹{snack.price}</p>

          <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {snack.description || "Freshly homemade with love. Perfect for your daily cravings."}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-md text-sm font-bold ${isSoldOut ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isSoldOut ? 'Out of Stock' : `${snack.stock} Available`}
                </span>
            </div>

            <div className="flex gap-4 mt-4">
              {/* Qty Counter */}
              <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={isSoldOut}
                  className="p-2 text-gray-500 hover:text-dark disabled:opacity-30"
                >
                  <FiMinus />
                </button>
                <span className="w-10 text-center font-bold text-lg">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(snack.stock, qty + 1))}
                  disabled={isSoldOut}
                  className="p-2 text-gray-500 hover:text-dark disabled:opacity-30"
                >
                  <FiPlus />
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 bg-secondary text-white font-bold rounded-full py-4 hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-red-200"
              >
                {isSoldOut ? 'Sold Out' : `Add to Cart • ₹${snack.price * qty}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}