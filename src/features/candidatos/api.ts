import { request } from '@/lib/api';
import type { Candidato, CandidaturaVaga } from './types';
import type { StatusCandidatura } from '@/features/candidato/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UsuariosPaginados {
  docs: Candidato[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

export async function getCandidatos(): Promise<{ docs: Candidato[]; totalDocs: number }> {
  const res = await request<ApiResponse<UsuariosPaginados>>('/api/usuarios?limit=100');
  return {
    docs: res.data?.docs ?? [],
    totalDocs: res.data?.totalDocs ?? 0,
  };
}

export async function getCandidaturasDaVaga(vagaId: string): Promise<CandidaturaVaga[]> {
  const res = await request<ApiResponse<CandidaturaVaga[]>>(`/api/vagas/${vagaId}/candidaturas`);
  return res.data ?? [];
}

export async function atualizarStatusCandidatura(
  usuarioId: string,
  vagaId: string,
  status: StatusCandidatura,
): Promise<CandidaturaVaga> {
  const res = await request<ApiResponse<CandidaturaVaga>>(
    `/api/usuarios/${usuarioId}/candidatura/${vagaId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, movidoPor: 'recrutador' }),
    },
  );
  return res.data;
}
