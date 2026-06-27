import { Navigate, Outlet } from 'react-router-dom';

export function PublicLayout() {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
