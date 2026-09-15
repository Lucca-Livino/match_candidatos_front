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

/**
 * Reprocessa a triagem de uma candidatura pendente. So o backend decide se
 * pode: fora de 'inscrito' responde 409, e o painel apenas nao oferece o botao.
 */
export async function reavaliarCandidatura(vagaId: string, usuarioId: string): Promise<void> {
  await request(`/api/vagas/${vagaId}/candidaturas/${usuarioId}/reavaliar`, { method: 'POST' });
}
