import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { PublicLayout } from './PublicLayout';
import LoginPage from '@/pages/public/LoginPage';
import CandidatoLoginPage from '@/pages/public/CandidatoLoginPage';
import DashboardPage from '@/pages/auth/DashboardPage';
import VagasPage from '@/pages/auth/VagasPage';
import VagaNovaPage from '@/pages/auth/VagaNovaPage';
import VagaEditarPage from '@/pages/auth/VagaEditarPage';
import CandidatoHomePage from '@/pages/auth/CandidatoHomePage';
import VagaDetalhePage from '@/pages/auth/VagaDetalhePage';
import PerfilPage from '@/pages/auth/PerfilPage';
import MinhasCandidaturasPage from '@/pages/auth/MinhasCandidaturasPage';
import CandidaturaDetalhePage from '@/pages/auth/CandidaturaDetalhePage';
import CandidatoVagasPage from '@/pages/auth/CandidatoVagasPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login',           element: <LoginPage /> },
      { path: '/candidato/login', element: <CandidatoLoginPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/',                              element: <Navigate to="/dashboard" replace /> },
      // Área do recrutador
      { path: '/dashboard',                     element: <DashboardPage /> },
      { path: '/vagas',                         element: <VagasPage /> },
      { path: '/vagas/nova',                    element: <VagaNovaPage /> },
      { path: '/vagas/:id/editar',              element: <VagaEditarPage /> },
      // Área do candidato
      { path: '/candidato',                     element: <CandidatoHomePage /> },
      { path: '/candidato/vagas',               element: <CandidatoVagasPage /> },
      { path: '/vagas/:id',                     element: <VagaDetalhePage /> },
      { path: '/perfil',                        element: <PerfilPage /> },
      { path: '/minhas-candidaturas',           element: <MinhasCandidaturasPage /> },
      { path: '/minhas-candidaturas/:vagaId',   element: <CandidaturaDetalhePage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
