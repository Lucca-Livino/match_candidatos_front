import { request } from '@/lib/api';
import type { Candidato } from './types';

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
