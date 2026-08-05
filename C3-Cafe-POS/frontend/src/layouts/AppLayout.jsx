import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

export default function AppLayout() {
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen bg-cafe-bg text-cafe-dark overflow-hidden font-sans">
      {/* Fixed Top Header */}
      <Header />

      {/* Center Layout: Sidebar + Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-100/70" tabIndex={-1}>
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Bottom Footer */}
      <Footer />
    </div>
  );
}
