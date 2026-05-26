import { useEffect, useState } from 'react';
import { getMe, type AuthUser } from '@/lib/api';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = localStorage.getItem('auth_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!localStorage.getItem('auth_user'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        localStorage.setItem('auth_user', JSON.stringify(data));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
}
