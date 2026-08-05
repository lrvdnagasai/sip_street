import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Sidebar() {
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/', enabled: true },
    { name: 'Categories', path: '/categories', enabled: true },
    { name: 'Products', path: '/products', enabled: true },
    { name: 'Billing', path: '/billing', enabled: true },
    { name: 'Receipts', path: '/receipts', enabled: true },
    { name: 'Reports', path: '/reports', enabled: true },
    { name: 'Expenses', path: '/expenses', enabled: true },
    { name: 'Backup & Restore', path: '/backup', enabled: true },
    { name: 'Settings', path: '/settings', enabled: true },
  ];

  return (
    <aside className="w-56 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 select-none border-r border-stone-800">
      {/* Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map((item) => {
          if (item.enabled) {
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-lg font-medium text-sm transition ${
                    isActive
                      ? 'bg-amber-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`
                }
              >
                <span>{item.name}</span>
                <span className="w-2 h-2 rounded-full bg-accent-gold"></span>
              </NavLink>
            );
          }

          return (
            <div
              key={item.name}
              className="flex items-center justify-between px-3.5 py-3 rounded-lg font-medium text-sm text-stone-600 bg-stone-900/50 border border-stone-800/40 cursor-not-allowed"
              title="Module coming soon in future updates"
            >
              <span>{item.name}</span>
              <span className="text-[10px] bg-stone-800/80 text-stone-500 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Soon
              </span>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Bottom Action */}
      <div className="p-3 border-t border-stone-800/80 bg-stone-950/40">
        <button
          onClick={logout}
          className="w-full h-11 px-3.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 hover:text-rose-200 text-stone-300 font-medium text-sm transition flex items-center justify-between"
        >
          <span>Exit Session</span>
          <span className="text-xs font-mono">Logout</span>
        </button>
      </div>
    </aside>
  );
}
