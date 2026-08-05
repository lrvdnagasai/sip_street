import React from 'react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-stone-800 border border-stone-700 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-extrabold text-stone-300">No Connection</h1>
        <p className="text-xs text-stone-400">
          Network connectivity to the POS backend service is currently offline.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="h-11 px-6 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs transition shadow-lg w-full"
        >
          Check Connection
        </button>
      </div>
    </div>
  );
}
