import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { RoleLayout } from './RoleLayout';
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
import RecrutadorPerfilPage from '@/pages/auth/RecrutadorPerfilPage';
import SuportePerfilPage from '@/pages/auth/SuportePerfilPage';
import MinhasCandidaturasPage from '@/pages/auth/MinhasCandidaturasPage';
import CandidaturaDetalhePage from '@/pages/auth/CandidaturaDetalhePage';
import CandidatoVagasPage from '@/pages/auth/CandidatoVagasPage';
import CandidatosPage from '@/pages/auth/CandidatosPage';
import VagaCandidatosPage from '@/pages/auth/VagaCandidatosPage';
import SuporteConfiguracaoPage from '@/pages/auth/SuporteConfiguracaoPage';
import SuporteAvaliacoesPage from '@/pages/auth/SuporteAvaliacoesPage';
import FichaCandidatoPage from '@/pages/auth/FichaCandidatoPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login',           element: <LoginPage /> },
      { path: '/candidato/login', element: <CandidatoLoginPage /> },
    ],
  },
  // Área do recrutador (recrutador / administrador)
  {
    element: <RoleLayout area="recrutador" />,
    children: [
      { path: '/',                              element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',                     element: <DashboardPage /> },
      { path: '/vagas',                         element: <VagasPage /> },
      { path: '/vagas/nova',                    element: <VagaNovaPage /> },
      { path: '/vagas/:id/editar',              element: <VagaEditarPage /> },
      { path: '/vagas/:id/candidatos',          element: <VagaCandidatosPage /> },
      { path: '/candidatos',                    element: <CandidatosPage /> },
      { path: '/recrutador/perfil',             element: <RecrutadorPerfilPage /> },
    ],
  },
  // Área do candidato
  {
    element: <RoleLayout area="candidato" />,
    children: [
      { path: '/candidato',                     element: <CandidatoHomePage /> },
      { path: '/candidato/vagas',               element: <CandidatoVagasPage /> },
      { path: '/vagas/:id',                     element: <VagaDetalhePage /> },
      { path: '/perfil',                        element: <PerfilPage /> },
      { path: '/minhas-candidaturas',           element: <MinhasCandidaturasPage /> },
      { path: '/minhas-candidaturas/:vagaId',   element: <CandidaturaDetalhePage /> },
    ],
  },
  // Área do suporte
  {
    element: <RoleLayout area="suporte" />,
    children: [
      { path: '/suporte/avaliacoes',            element: <SuporteAvaliacoesPage /> },
      { path: '/suporte/configuracao',          element: <SuporteConfiguracaoPage /> },
      { path: '/suporte/perfil',                element: <SuportePerfilPage /> },
    ],
  },
  // Impressão: ficha do candidato, sem header/footer (recrutador, admin, suporte)
  {
    element: <RoleLayout area="impressao" />,
    children: [
      { path: '/impressao/vagas/:vagaId/candidatos/:usuarioId', element: <FichaCandidatoPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
