import React from 'react';
import useAuthStore from '../store/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-coffee-brown text-white shadow-md px-6 py-3 flex justify-between items-center select-none sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-accent-gold text-cafe-dark flex items-center justify-center font-bold text-xl shadow border border-amber-300/40">
          C³
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide">C³ Cafe POS</h1>
          <p className="text-[11px] text-amber-200/80 font-medium leading-none">
            Chai • Coffee • Conversations
          </p>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-amber-950/40 border border-amber-700/30 px-3.5 py-1.5 rounded-lg">
            <div className="text-right">
              <div className="text-sm font-semibold text-amber-50 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-amber-200/70 font-mono uppercase tracking-wider">
                @{user.username}
              </div>
            </div>

            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-amber-400 text-amber-950 border border-amber-300'
                  : 'bg-stone-200 text-stone-900 border border-stone-300'
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="h-10 px-4 rounded-lg bg-amber-800/60 hover:bg-amber-800 text-amber-100 font-medium text-sm border border-amber-600/40 transition active:scale-95 flex items-center space-x-2"
          title="Log out of application"
        >
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
