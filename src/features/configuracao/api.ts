import { request } from '@/lib/api';
import type { ConfiguracaoIntegracao, ConfiguracaoPatch } from './types';

// Envelope de `sendSuccess` na API: { success, message, data }.
interface Envelope<T> {
  data: T;
}

export async function getConfiguracao(): Promise<ConfiguracaoIntegracao> {
  const res = await request<Envelope<ConfiguracaoIntegracao>>('/api/configuracao-integracao');
  return res.data;
}

export async function patchConfiguracao(
  payload: ConfiguracaoPatch,
): Promise<ConfiguracaoIntegracao> {
  const res = await request<Envelope<ConfiguracaoIntegracao>>('/api/configuracao-integracao', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}
