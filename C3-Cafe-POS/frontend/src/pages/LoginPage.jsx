import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore, { LAST_USERNAME_KEY } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Pre-fill username from localStorage if previously stored
    const savedUsername = localStorage.getItem(LAST_USERNAME_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cafe-bg flex items-center justify-center p-4 md:p-8 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-coffee-brown text-white p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-accent-gold text-cafe-dark mx-auto flex items-center justify-center font-bold text-2xl shadow-lg border border-amber-200/40 mb-3">
            C³
          </div>
          <h1 className="text-2xl font-bold tracking-wide">C³ Cafe POS</h1>
          <p className="text-xs text-amber-200/80 font-medium uppercase tracking-wider mt-1">
            Chai • Coffee • Conversations
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Error Banner */}
          {(localError || error) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5 flex items-start space-x-2">
              <span className="font-bold shrink-0">!</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-[0.99] text-white font-bold text-base shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Version Footer */}
          <div className="pt-2 text-center text-xs text-stone-400 font-medium border-t border-stone-100">
            C³ Cafe POS • Version 1.0
          </div>
        </form>
      </div>
    </div>
  );
}
