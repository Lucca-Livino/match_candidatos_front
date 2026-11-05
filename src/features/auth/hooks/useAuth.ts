import { useState, useEffect } from 'react';
import { getMe } from '../api';
import type { AuthUser } from '../types';

// Usuário salvo pelo login. Cache do login (better-auth) pode não ter o
// papel; nesse caso devolve null e o hook busca /me.
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
  // Lido uma vez, no estado inicial: com cache válido não há efeito a rodar.
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
