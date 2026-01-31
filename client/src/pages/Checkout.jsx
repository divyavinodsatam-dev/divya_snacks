import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { sendOtp, placeOrderWithOtp } from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  
  // UI State
  const [step, setStep] = useState('DETAILS'); // 'DETAILS' or 'OTP'
  const [loading, setLoading] = useState(false);

  // Data State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // 1. Trigger TextBee SMS
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) return toast.error("Please enter your name");
    if (phone.length !== 10) return toast.error("Please enter a valid 10-digit number");
    
    setLoading(true);
    try {
      // Call Backend API
      await sendOtp(phone);
      
      toast.success("OTP Sent to your mobile!");
      setStep('OTP'); // Move to next screen
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Place Order
  const handleVerifyAndPlaceOrder = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) return toast.error("Enter valid 4-digit OTP");

    setLoading(true);
    try {
      // Prepare data exactly as Backend expects
      const orderData = {
        customerName: name,
        customerPhone: phone,
        otp: otp,
        items: cart.map(i => ({ 
            snackId: i._id, 
            quantity: i.qty 
        }))
      };

      const response = await placeOrderWithOtp(orderData);
      
      toast.success("Order Placed Successfully! 🎉");
      clearCart();
      navigate('/'); // Redirect to Home
    } catch (error) {
      console.error(error);
      // Show specific error from backend (e.g., "Invalid OTP")
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <div className="bg-[#FF5722] px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => step === 'OTP' ? setStep('DETAILS') : navigate('/cart')} 
          className="text-white p-1"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-white text-xl font-bold tracking-wide">Secure Checkout</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        
        {/* ORDER SUMMARY */}
        <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h2>
          <div className="space-y-2 mb-4 border-b border-gray-100 pb-4 text-sm text-gray-600">
            {cart.map(item => (
              <div key={item._id} className="flex justify-between">
                <span>{item.qty} x {item.name}</span>
                <span className="font-medium text-gray-900">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Payable:</span>
            <span className="text-green-600 text-xl">₹{getCartTotal()}</span>
          </div>
        </div>

        {/* STEP 1: DETAILS FORM */}
        {step === 'DETAILS' ? (
          <div>
            <h2 className="font-bold text-lg mb-4 text-gray-800">Delivery Details</h2>
            <form onSubmit={handleSendOtp} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all bg-white"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Phone Number</label>
                <div className="flex gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl px-4 flex items-center font-bold text-gray-500">
                    +91
                  </div>
                  <input 
                    type="number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.slice(0, 10))} // Limit to 10 chars
                    className="flex-1 border border-gray-200 rounded-xl p-4 text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all bg-white"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] text-black font-extrabold text-lg py-4 rounded-xl shadow-md mt-4 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
              >
                {loading ? 'Sending SMS...' : 'Send OTP via SMS'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <div>
            <h2 className="font-bold text-lg mb-2 text-gray-800">Verify Mobile</h2>
            <p className="text-gray-500 text-sm mb-6">Enter the 4-digit code sent to +91 {phone}</p>
            
            <form onSubmit={handleVerifyAndPlaceOrder}>
              <div className="mb-8">
                <input 
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Numbers only
                  className="w-full border border-gray-200 rounded-xl p-4 text-center text-3xl tracking-[0.5em] font-bold text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white placeholder:tracking-normal"
                  placeholder="XXXX"
                  autoFocus
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] text-black font-extrabold text-lg py-4 rounded-xl shadow-md mb-6 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Verify & Place Order'}
              </button>
            </form>

            <button 
              onClick={() => setStep('DETAILS')}
              className="w-full text-[#FF5722] font-bold text-sm hover:underline"
            >
              Change Phone Number
            </button>
          </div>
        )}

      </div>
    </div>
  );
}