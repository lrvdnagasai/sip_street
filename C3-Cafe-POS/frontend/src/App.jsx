import React, { useEffect } from 'react';
import AppRouter from './router';
import useAuthStore from './store/authStore';

export default function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
