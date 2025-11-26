import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken, loadTokens } from './tokenStore';
import { api } from '../api/client';

export function RequireAuth() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'fail'
  const location = useLocation();

  useEffect(() => {
    loadTokens();
    const token = getAccessToken();
    if (!token) {
      setStatus('fail');
      return;
    }
    api.get('/auth/me')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('fail'));
  }, [location.pathname]);

  if (status === 'checking') return null; // or loading indicator
  if (status === 'fail') return <Navigate to="/login" replace />;
  return <Outlet />;
}
