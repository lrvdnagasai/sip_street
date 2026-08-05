import React from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-cafe-bg text-cafe-dark">
      {/* App Header */}
      <header className="bg-coffee-brown text-white shadow-md px-6 py-4 flex justify-between items-center select-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center font-bold text-cafe-dark text-xl shadow">
            C³
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">C³ Cafe POS</h1>
            <p className="text-xs text-amber-200/80 font-medium">Chai • Coffee • Conversations</p>
          </div>
        </div>

        {/* Header Navigation Placeholder */}
        <nav className="flex items-center space-x-4 text-sm font-medium">
          <span className="px-3 py-1.5 rounded-lg bg-amber-900/40 text-amber-100 border border-amber-700/30">
            Offline Mode
          </span>
        </nav>
      </header>

      {/* Main Content Container optimized for Tablet Landscape */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>

      {/* App Footer */}
      <footer className="bg-cafe-dark text-stone-400 text-xs px-6 py-3 border-t border-stone-700 flex justify-between items-center">
        <div>&copy; {new Date().getFullYear()} C³ Cafe Hyderabad. All rights reserved.</div>
        <div className="flex items-center space-x-4">
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
