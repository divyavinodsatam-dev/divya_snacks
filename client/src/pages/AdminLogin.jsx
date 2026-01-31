import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { adminLogin } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay for better UX
    await new Promise(r => setTimeout(r, 800));

    if (await adminLogin(username, password)) {
      localStorage.setItem('isAdmin', 'true');
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid Credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* 1. ORANGE HEADER */}
      <div className="bg-[#FF5722] px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link to="/" className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-white text-xl font-bold tracking-wide">Admin Login</h1>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Admin Portal</h2>
          <p className="text-gray-400 font-medium">Please sign in to continue</p>
        </div>

        {/* 3. LOGIN CARD */}
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-6 md:p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block w-full pl-11 p-3.5 outline-none transition-all font-medium"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block w-full pl-11 pr-10 p-3.5 outline-none transition-all font-medium"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-300 text-black font-extrabold rounded-xl text-lg px-5 py-3.5 text-center mt-4 shadow-lg shadow-yellow-200 hover:shadow-yellow-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* 4. FOOTER LINK */}
        <Link to="/" className="mt-12 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm">
          <FiArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}