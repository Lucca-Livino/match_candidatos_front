import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

export function useLoginForm(redirectTo: string) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

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

      if (data?.token) localStorage.setItem('auth_token', data.token);
      if (data?.user)  localStorage.setItem('auth_user', JSON.stringify(data.user));

      navigate(redirectTo, { replace: true });
    } catch {
      setError('Erro ao conectar com a API. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, isLoading, error, handleSubmit };
}
