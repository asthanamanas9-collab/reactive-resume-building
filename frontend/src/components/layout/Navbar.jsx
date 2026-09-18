import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase() || <User size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 leading-none">{user?.full_name || user?.username}</span>
              <span className="text-xs text-slate-500 mt-1">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
