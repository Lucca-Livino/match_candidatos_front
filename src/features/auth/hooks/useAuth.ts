import { useState, useEffect } from 'react';
import { getMe } from '../api';
import type { AuthUser } from '../types';

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem('auth_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached) as AuthUser);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    getMe()
      .then(u => {
        setUser(u);
        localStorage.setItem('auth_user', JSON.stringify(u));
      })
      .catch(() => setError('Falha ao carregar usuário'))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
