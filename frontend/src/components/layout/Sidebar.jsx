import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/dashboard', icon: <Users size={20} /> }, // Can be separated later
    // { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
  ];

  return (
    <aside className="bg-slate-900 text-white w-64 min-h-screen flex flex-col shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Activity className="text-blue-500" size={28} />
        <h1 className="text-xl font-bold tracking-tight">AI Predictor</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 AI-Driven Edu
      </div>
    </aside>
  );
};

export default Sidebar;
