import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, papelDe, homeDoPapel } from '@/features/auth';

export function PublicLayout() {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return <PublicRedirect />;
}

// Autenticado numa rota pública: manda pra home do papel.
// Enquanto valida a sessão, mostra o formulário (Outlet) em vez de tela branca.
// Só redireciona quando o usuário está confirmado.
function PublicRedirect() {
  const { user, loading } = useAuth();
  if (loading || !user) return <Outlet />;
  return <Navigate to={homeDoPapel(papelDe(user))} replace />;
}
