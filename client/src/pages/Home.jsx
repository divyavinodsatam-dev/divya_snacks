import { useEffect, useState } from 'react';
import { fetchSnacks, fetchCategories } from '../services/api';
import HeroCard from '../components/HeroCard';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [snacks, setSnacks] = useState([]);
  const [categories, setCategories] = useState([]);
  // 1. Initialize as 'All'
  const [selectedCat, setSelectedCat] = useState('All'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sData, cData] = await Promise.all([fetchSnacks(), fetchCategories()]);
        setSnacks(sData);
        
        // Add 'All' to categories list
        const cats = [{ _id: 'all', name: 'All' }, ...cData];
        setCategories(cats);

        // 2. FIX: Force selection to 'All' so everything shows by default
        setSelectedCat('All');

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter Logic
  const filtered = snacks.filter(s => 
    String(s.isAvailable) !== 'false' && (selectedCat === 'All' || s.category === selectedCat)
  );

  // Split items: Top 4 -> Hero, Rest -> Grid
  const heroItems = filtered.slice(0, 4);
  const gridItems = filtered.slice(4);

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <>
      <div className="container mx-auto pb-24 md:pb-8 pl-0 pt-4">
        
        {/* Title Header */}
        {/* <div className="pl-16 md:pl-24 mb-6">
           <h1 className="text-4xl font-extrabold text-dark leading-none">
             Deliver <br /> to home
           </h1>
        </div> */}

        <div className="flex">
          {/* --- VERTICAL SIDEBAR (Categories) --- */}
          <div className="w-16 md:w-24 flex flex-col items-center gap-12 pt-10 flex-shrink-0">
            {categories.map(cat => {
              const isActive = selectedCat === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCat(cat.name)}
                  className="relative h-24 w-full flex items-center justify-center group"
                >
                  {isActive && (
                    <span className="absolute left-4 md:left-8 w-2 h-2 bg-[#FFD700] rounded-full"></span>
                  )}
                  <span 
                    className={`transform -rotate-90 whitespace-nowrap text-lg tracking-wide transition-all ${
                      isActive ? 'font-bold text-black' : 'text-gray-400 font-medium hover:text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* --- MAIN CONTENT (Right Side) --- */}
          <div className="flex-1 pr-0 md:pr-4 overflow-hidden">
            
            {/* 1. HERO CAROUSEL (First 4 items) */}
            <div className="mb-10">
              {heroItems.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
                  {heroItems.map(item => (
                    <div key={item._id} className="min-w-[85vw] md:min-w-[400px]">
                      <HeroCard item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-[40px] h-[300px] flex items-center justify-center text-gray-400 mx-4">
                  No items available
                </div>
              )}
            </div>

            {/* 2. GRID SECTION (Remaining items) */}
            <div className="px-4">
              <h3 className="text-xl font-bold mb-4 ml-1">More Snacks</h3>
              {gridItems.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8">
                  {gridItems.map(item => (
                    <ProductCard key={item._id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic ml-1">No more items to show.</p>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}