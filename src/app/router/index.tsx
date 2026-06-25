import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { PublicLayout } from './PublicLayout';
import LoginPage from '@/pages/public/LoginPage';
import DashboardPage from '@/pages/auth/DashboardPage';
import VagasPage from '@/pages/auth/VagasPage';
import VagaNovaPage from '@/pages/auth/VagaNovaPage';
import VagaEditarPage from '@/pages/auth/VagaEditarPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/',                    element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',           element: <DashboardPage /> },
      { path: '/vagas',               element: <VagasPage /> },
      { path: '/vagas/nova',          element: <VagaNovaPage /> },
      { path: '/vagas/:id/editar',    element: <VagaEditarPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
