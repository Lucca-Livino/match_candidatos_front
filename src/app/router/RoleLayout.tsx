import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, papelDe, homeDoPapel, papelPermitidoNaArea, type Area } from '@/features/auth';

interface RoleLayoutProps {
  area: Area;
}

// Guarda de rota por papel: separa a área do recrutador da área do candidato.
export function RoleLayout({ area }: RoleLayoutProps) {
  const token = localStorage.getItem('auth_token');
  const loginPath = area === 'candidato' ? '/candidato/login' : '/login';

  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  const { user, loading } = useAuth();
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
