import { FiBox, FiGrid, FiList, FiLogOut } from 'react-icons/fi';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'Orders', icon: <FiList />, label: 'Orders' },
    { id: 'Menu', icon: <FiBox />, label: 'Manage Menu' },
    { id: 'Categories', icon: <FiGrid />, label: 'Categories' },
  ];

  return (
    <div className="w-full md:w-64 bg-white shadow-sm md:h-[calc(100vh-80px)] md:sticky md:top-20 p-4">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-primary text-black font-bold shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        
        <div className="border-t my-2 hidden md:block"></div>
        
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all md:mt-auto"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}