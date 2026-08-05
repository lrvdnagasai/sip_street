import React from 'react';

export default function ServerErrorPage({ onRetry }) {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-stone-800 border border-stone-700 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-4xl font-extrabold text-amber-500 font-mono">500</h1>
        <h2 className="text-xl font-bold text-white">System Error</h2>
        <p className="text-xs text-stone-400">
          The POS server encountered an internal issue. Please verify backend service status.
        </p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-lg w-full"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
