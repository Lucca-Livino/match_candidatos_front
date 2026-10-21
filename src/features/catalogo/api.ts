import { request } from '@/lib/api';
import type { ItemCatalogo, TipoCatalogo } from './types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function buscarCatalogo(tipo: TipoCatalogo, q: string, limit = 10): Promise<ItemCatalogo[]> {
  const params = new URLSearchParams({ tipo, q, limit: String(limit) });
  const res = await request<ApiResponse<ItemCatalogo[]>>(`/api/catalogo?${params}`);
  return res.data ?? [];
}
