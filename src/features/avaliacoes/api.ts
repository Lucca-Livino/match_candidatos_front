import { request } from '@/lib/api';
import type { AvaliacaoAuditoria, FiltrosAuditoria } from './types';

interface Envelope<T> {
  data: T;
}

export async function getAvaliacoes(filtros: FiltrosAuditoria = {}): Promise<AvaliacaoAuditoria[]> {
  const query = filtros.apenasPendentes ? '?pendentes=true' : '';
  const res = await request<Envelope<AvaliacaoAuditoria[]>>(`/api/avaliacoes${query}`);
  return res.data;
}
