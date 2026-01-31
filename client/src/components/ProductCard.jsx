import { Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';

export default function ProductCard({ item }) {
  return (
    <Link to={`/snack/${item._id}`} className="block group">
      <div className="bg-white rounded-[30px] p-4 flex flex-col items-center text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] transition-all duration-300">
        <div className="h-32 w-full flex items-center justify-center mb-4">
          <img 
            src={`${BASE_URL}${item.images[0]}`} 
            alt={item.name} 
            className="h-full w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h3 className="font-bold text-dark text-lg truncate w-full">{item.name}</h3>
        <p className="font-extrabold text-dark mt-1">₹{item.price}</p>
      </div>
    </Link>
  );
}