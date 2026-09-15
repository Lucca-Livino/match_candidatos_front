import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, papelDe, homeDoPapel, papelPermitidoNaArea, type Area } from '@/features/auth';

interface RoleLayoutProps {
  area: Area;
}

// Guarda de rota por papel: separa a área do recrutador, a do candidato e a
// do suporte.
export function RoleLayout({ area }: RoleLayoutProps) {
  // Todo hook vem ANTES de qualquer return condicional. Chamar useAuth depois
  // do early return de "sem token" fazia a contagem de hooks mudar entre
  // renders — se o token sumisse com o componente montado (logout, 401), o
  // React quebrava com "rendered fewer hooks than expected".
  const { user, loading } = useAuth();

  const token = localStorage.getItem('auth_token');
  const loginPath = area === 'candidato' ? '/candidato/login' : '/login';

  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  if (loading) return null;

  const papel = papelDe(user);
  if (!user || !papel) {
    return <Navigate to={loginPath} replace />;
  }

  // Papel fora da área: manda pra home do próprio papel.
  if (!papelPermitidoNaArea(papel, area)) {
    return <Navigate to={homeDoPapel(papel)} replace />;
  }

  return <Outlet />;
}
