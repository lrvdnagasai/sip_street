import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-stone-200 p-8 space-y-6">
        {/* Error Code Badge */}
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center font-black text-2xl border border-rose-200">
          403
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cafe-dark">Access Denied</h1>
          <p className="text-sm text-stone-600">
            You do not have permission to view or manage this module. Please contact an Administrator if you require access.
          </p>
        </div>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-sm shadow transition active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
