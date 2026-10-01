import { request } from '@/lib/api';
import type { Periodo, RelatorioGeral, RelatorioVaga } from './types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getRelatorioGeral(periodo: Periodo): Promise<RelatorioGeral> {
  const res = await request<ApiResponse<RelatorioGeral>>(`/api/vagas/relatorio?periodo=${periodo}`);
  return res.data;
}

export async function getRelatorioVaga(vagaId: string, periodo: Periodo): Promise<RelatorioVaga> {
  const res = await request<ApiResponse<RelatorioVaga>>(
    `/api/vagas/${encodeURIComponent(vagaId)}/relatorio?periodo=${periodo}`,
  );
  return res.data;
}
