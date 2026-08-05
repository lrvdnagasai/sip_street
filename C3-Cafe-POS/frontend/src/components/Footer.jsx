import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-cafe-dark text-stone-400 text-xs px-6 py-2.5 border-t border-stone-800 flex justify-between items-center shrink-0 select-none">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-stone-300">C³ Cafe POS</span>
        <span className="text-stone-600">•</span>
        <span>Version 1.0</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-medium text-emerald-400/90 text-[11px] uppercase tracking-wider">
          Offline Local Mode
        </span>
      </div>
    </footer>
  );
}
