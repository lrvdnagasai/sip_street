import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-stone-800 border border-stone-700 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-4xl font-extrabold text-rose-500 font-mono">403</h1>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-stone-400">
          You do not have administrative permissions to view this module. Please contact your manager.
        </p>
        <button
          onClick={() => navigate('/billing')}
          className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg w-full"
        >
          Go to Billing Terminal
        </button>
      </div>
    </div>
  );
}
