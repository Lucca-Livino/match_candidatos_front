import { request } from '@/lib/api';
import type { Vaga, VagaPayload, VagasPaginadasResult } from './types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function normalizeVaga(v: Vaga & { _id?: string; createdAt?: string }): Vaga {
  return {
    ...v,
    id: v.id ?? v._id ?? '',
    criadoEm: v.criadoEm ?? v.createdAt,
  };
}

export async function getVagas(): Promise<Vaga[]> {
  const res = await request<ApiResponse<VagasPaginadasResult>>('/api/vagas?limit=100');
  return (res.data?.docs ?? []).map(normalizeVaga);
}

export async function getVaga(id: string): Promise<Vaga> {
  const res = await request<ApiResponse<Vaga>>(`/api/vagas/${id}`);
  return normalizeVaga(res.data);
}

export async function createVaga(payload: VagaPayload): Promise<Vaga> {
  const res = await request<ApiResponse<Vaga>>('/api/vagas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeVaga(res.data);
}

export async function updateVaga(id: string, payload: Partial<VagaPayload>): Promise<Vaga> {
  const res = await request<ApiResponse<Vaga>>(`/api/vagas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeVaga(res.data);
}

export async function getVagasPaginadas(
  page: number,
  limit = 6,
  filters: { area?: string; status?: string; q?: string } = {},
): Promise<VagasPaginadasResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.area)   params.set('area', filters.area);
  if (filters.status) params.set('status', filters.status);
  if (filters.q)      params.set('titulo', filters.q);

  const res = await request<ApiResponse<VagasPaginadasResult> | VagasPaginadasResult>(
    `/api/vagas?${params.toString()}`,
  );

  const data = 'success' in res ? (res as ApiResponse<VagasPaginadasResult>).data : res;

  return {
    docs:       (data.docs ?? []).map(normalizeVaga),
    totalDocs:  data.totalDocs  ?? 0,
    totalPages: data.totalPages ?? 1,
    page:       data.page       ?? page,
  };
}
