import { request } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type StatusCandidatura = 'inscrito' | 'em_analise' | 'aprovado' | 'reprovado';

export interface Candidatura {
  id: string;
  usuarioId: string;
  vagaId: string;
  compativel: number;
  motivoIncompat_?: string;
  status: StatusCandidatura;
  movidoPor?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export async function candidatarNaVaga(userId: string, vagaId: string): Promise<Candidatura> {
  const res = await request<ApiResponse<Candidatura>>(`/api/usuarios/${userId}/candidatura`, {
    method: 'POST',
    body: JSON.stringify({ vagaId }),
  });
  return res.data;
}

export async function listarCandidaturas(userId: string): Promise<Candidatura[]> {
  const res = await request<ApiResponse<Candidatura[]>>(
    `/api/usuarios/${userId}/candidatura`,
  );
  return res.data ?? [];
}

export async function getCandidatura(userId: string, vagaId: string): Promise<Candidatura> {
  const res = await request<ApiResponse<Candidatura>>(
    `/api/usuarios/${userId}/candidatura/${vagaId}`,
  );
  return res.data;
}

export async function getCandidaturasIds(userId: string): Promise<string[]> {
  const list = await listarCandidaturas(userId);
  return list.map(c => c.vagaId);
}
