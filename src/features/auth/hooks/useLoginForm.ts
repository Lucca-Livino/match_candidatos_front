import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api';
import { homeDoPapel, papelDe } from '../papel';
import type { AuthUser } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

const MENSAGEM_BLOQUEIO: Record<string, string> = {
  CONTA_DESATIVADA: 'Esta conta está desativada. Procure o administrador.',
  CONVITE_PENDENTE: 'Ative sua conta pelo link enviado por e-mail.',
};

/**
 * O better-auth autentica conta desativada normalmente; quem barra é a nossa
 * API, no /me. Consultado com fetch direto porque o cliente comum trata todo
 * 401 como sessão expirada e redireciona antes de a mensagem chegar à tela.
 */
async function bloqueioDaConta(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status !== 401) return null;
    const body = (await res.json().catch(() => null)) as { code?: string } | null;
    return (body?.code && MENSAGEM_BLOQUEIO[body.code]) || null;
  } catch {
    return null;
  }
}

/**
 * @param destinoPadrao Para onde ir quando o papel não puder ser determinado.
 */
export function useLoginForm(destinoPadrao: string) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * O usuário do Better Auth quase nunca traz `tipos_permissao` — o papel vive
   * na collection local. Sem consultá-lo aqui, o login mandava todo mundo para
   * o destino fixo da tela e o RoleLayout corrigia por ricochete: o suporte
   * passava por /dashboard, uma área que não é dele, antes de ser redirecionado.
   */
  async function destinoDoUsuario(userDoLogin: AuthUser | null): Promise<string> {
    const papelDoCache = papelDe(userDoLogin);
    if (papelDoCache) return homeDoPapel(papelDoCache);

    try {
      const completo = await getMe();
      localStorage.setItem('auth_user', JSON.stringify(completo));
      const papel = papelDe(completo);
      if (papel) return homeDoPapel(papel);
    } catch {
      // Sem papel, o RoleLayout ainda protege a rota: o destino padrão é um
      // palpite, não uma autorização.
    }
    return destinoPadrao;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || 'Credenciais inválidas. Tente novamente.');
        return;
      }

      if (data?.token) {
        const bloqueio = await bloqueioDaConta(data.token);
        if (bloqueio) {
          setError(bloqueio);
          return;
        }
      }

      // O token precisa estar salvo antes do getMe: é ele que autentica a chamada.
      if (data?.token) localStorage.setItem('auth_token', data.token);
      if (data?.user) localStorage.setItem('auth_user', JSON.stringify(data.user));

      navigate(await destinoDoUsuario(data?.user ?? null), { replace: true });
    } catch {
      setError('Erro ao conectar com a API. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, isLoading, error, handleSubmit };
}
