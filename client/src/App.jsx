import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import SnackDetail from './pages/SnackDetail';
import Cart from './pages/Cart';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import Checkout from './pages/Checkout';

// 1. Create a Layout Component for Public Pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA]">
      {/* This Navbar only shows for children of PublicLayout */}
      <Navbar /> 
      
      <main className="flex-grow">
        <Outlet /> {/* This is where Home, Cart, etc. will render */}
      </main>
      
      {/* You can add a Footer here if you want it on public pages only */}
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        }} />
        
        <Routes>
          {/* --- PUBLIC PAGES (Have Navbar) --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/snack/:id" element={<SnackDetail />} />
            <Route path="/cart" element={<Cart />} />
            {/* Add Search/Other public routes here */}
            <Route path="/search" element={<Search />} />
          </Route>

          {/* --- ADMIN PAGES (NO Navbar) --- */}
          {/* These are outside the layout, so they occupy the full screen with no top bar */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;