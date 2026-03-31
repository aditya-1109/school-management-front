import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';

function Header({ toggleSidebar, isSidebarOpen }) {

  const navigate = useNavigate();
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-slate-200 shadow-sm z-40 sticky top-0">

      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        {/* <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64 border border-transparent focus-within:bg-white focus-within:border-blue-500 transition-all">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none ml-2 text-sm text-gray-700 w-full placeholder-gray-400"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/home/notification')} className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;