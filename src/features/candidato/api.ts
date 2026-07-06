import { request } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function candidatarNaVaga(userId: string, vagaId: string): Promise<void> {
  await request(`/api/usuarios/${userId}/candidatura`, {
    method: 'POST',
    body: JSON.stringify({ vagaId }),
  });
}

export async function getCandidaturasIds(userId: string): Promise<string[]> {
  const res = await request<ApiResponse<{ vagaId: string }[]>>(
    `/api/usuarios/${userId}/candidatura`,
  );
  return (res.data ?? []).map(c => c.vagaId);
}
