import { Navigate, Outlet } from 'react-router-dom';

export function AuthLayout() {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
