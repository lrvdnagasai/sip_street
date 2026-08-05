import React from 'react';
import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">
            Welcome, {user?.full_name || 'Staff'}!
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            System ready for C³ Cafe operations. Authenticated as{' '}
            <span className="font-semibold text-stone-800">{user?.role}</span>.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
          {user?.role}
        </div>
      </div>

      {/* Dashboard Placeholder Card */}
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-200 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100/70 text-coffee-brown mx-auto flex items-center justify-center font-bold text-2xl border border-amber-200">
          ☕
        </div>

        <h2 className="text-xl font-bold text-cafe-dark">
          Dashboard Coming Soon
        </h2>

        <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          The POS core infrastructure, authentication, and application shell are successfully configured. Business modules (Billing, Categories, Products, Reports) will be enabled in upcoming releases.
        </p>

        <div className="pt-4 text-xs font-mono text-stone-400 border-t border-stone-100">
          C³ Cafe POS • Version 1.0
        </div>
      </div>
    </div>
  );
}
