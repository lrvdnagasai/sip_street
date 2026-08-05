import React, { useEffect, useState } from 'react';
import { getRootStatus } from '../services/api';
import { useAppStore } from '../store';

export default function HomePage() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setBackendConnected = useAppStore((state) => state.setBackendConnected);

  const fetchBackendStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRootStatus();
      setBackendData(data);
      setBackendConnected(true);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendStatus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-stone-200 max-w-xl w-full">
        {/* Welcome Header */}
        <div className="w-16 h-16 bg-coffee-brown/10 text-coffee-brown rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-coffee-brown mb-1">C³ Cafe POS</h1>
        <p className="text-sm font-semibold text-accent-gold uppercase tracking-wider mb-4">
          Version 1.0
        </p>

        <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium text-sm mb-8 border border-emerald-200">
          Frontend Setup Successful
        </div>

        {/* Backend Status Section */}
        <div className="bg-cafe-bg rounded-xl p-5 border border-stone-200 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700">Backend Status:</span>
            {loading ? (
              <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Connecting...
              </span>
            ) : error ? (
              <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                Disconnected
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                Connected
              </span>
            )}
          </div>

          {!loading && backendData && (
            <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-200">
              <div><strong className="text-stone-700">App Name:</strong> {backendData.app}</div>
              <div><strong className="text-stone-700">Backend Version:</strong> {backendData.version}</div>
              <div><strong className="text-stone-700">Server Status:</strong> {backendData.status}</div>
            </div>
          )}

          {!loading && error && (
            <div className="text-xs text-red-600 pt-2 border-t border-stone-200 flex justify-between items-center">
              <span>Could not reach FastAPI at http://localhost:8000</span>
              <button
                onClick={fetchBackendStatus}
                className="ml-2 text-xs bg-coffee-brown text-white px-2 py-1 rounded hover:bg-stone-800 transition"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
