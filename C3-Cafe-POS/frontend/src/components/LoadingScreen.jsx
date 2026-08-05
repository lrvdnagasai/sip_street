import React from 'react';

export default function LoadingScreen({ message = 'Loading C³ Cafe POS...' }) {
  return (
    <div className="min-h-screen bg-cafe-bg flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Cafe Logo Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-coffee-brown text-amber-100 flex items-center justify-center font-bold text-3xl shadow-xl border-2 border-accent-gold/40">
            C³
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-accent-gold/30 animate-ping opacity-75"></div>
        </div>

        {/* Cafe Title & Loader Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-coffee-brown tracking-wide">
            C³ Cafe POS
          </h1>
          <p className="text-xs font-semibold text-amber-900/70 uppercase tracking-wider">
            Chai • Coffee • Conversations
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur px-5 py-3 rounded-full border border-stone-200 shadow-sm">
          <div className="w-5 h-5 border-3 border-coffee-brown border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-cafe-dark">{message}</span>
        </div>
      </div>
    </div>
  );
}
