import { useState, useEffect } from 'react';
import { getMe } from '../api';
import type { AuthUser } from '../types';

function lerCache(): AuthUser | null {
  const cached = localStorage.getItem('auth_user');
  if (!cached) return null;
  try {
    const parsed = JSON.parse(cached) as AuthUser;
    return parsed.tipos_permissao?.length ? parsed : null;
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
}

export function useAuth() {
  const [cache]               = useState(lerCache);
  const [user, setUser]       = useState<AuthUser | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    getMe()
      .then(u => {
        setUser(u);
        localStorage.setItem('auth_user', JSON.stringify(u));
      })
      .catch(() => setError('Falha ao carregar usuário'))
      .finally(() => setLoading(false));
  }, [cache]);

  return { user, loading, error };
}
