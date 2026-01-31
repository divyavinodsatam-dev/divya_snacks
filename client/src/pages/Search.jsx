import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { fetchSnacks, fetchCategories, BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Search() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('none'); // 'none', 'asc', 'desc'

  useEffect(() => {
    const load = async () => {
      try {
        const [sData, cData] = await Promise.all([fetchSnacks(), fetchCategories()]);
        setAllItems(sData);
        setCategories([{ _id: 'all', name: 'All' }, ...cData]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // --- FILTER & SORT LOGIC ---
  const filteredItems = allItems
    .filter(item => {
      // 1. Text Search
      const matchesSearch = item.name.toLowerCase().includes(query.toLowerCase()) || 
                            item.category.toLowerCase().includes(query.toLowerCase());
      
      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // 3. Price Sorting
      if (priceSort === 'asc') return a.price - b.price;
      if (priceSort === 'desc') return b.price - a.price;
      return 0;
    });

  const togglePriceSort = () => {
    if (priceSort === 'none') setPriceSort('asc');
    else if (priceSort === 'asc') setPriceSort('desc');
    else setPriceSort('none');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      
      {/* 1. HEADER */}
      {/* <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-dark">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-dark mr-8">Search</h1>
      </div> */}

      <div className="p-4 pb-24">
        
        {/* 2. SEARCH INPUT */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <FiSearch size={20} />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 text-base rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary block w-full pl-11 p-4 shadow-sm outline-none"
            placeholder="Search name, category..."
          />
        </div>

        {/* 3. FILTER CHIPS */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          
          {/* Price Sort Chip */}
          <button 
            onClick={togglePriceSort}
            className={`flex items-center gap-1 px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
              priceSort !== 'none' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {priceSort === 'asc' && <FiArrowUp />}
            {priceSort === 'desc' && <FiArrowDown />}
            Price
          </button>

          {/* Category Chips */}
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.name 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 4. RESULTS LIST */}
        <div className="flex flex-col gap-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No items found</div>
          ) : (
            filteredItems.map(item => (
              <Link 
                to={`/snack/${item._id}`} 
                key={item._id}
                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                {/* Thumbnail */}
                <div className="h-20 w-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={`${BASE_URL}${item.images[0]}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">{item.category}</p>
                  <p className="text-green-600 font-bold">₹{item.price}</p>
                </div>

                {/* Arrow Icon */}
                <div className="text-gray-300 pr-2">
                  <FiChevronRight size={24} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}