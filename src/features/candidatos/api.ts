import { request } from '@/lib/api';
import type { Candidato } from './types';

export async function getCandidatos(): Promise<Candidato[]> {
  return request<Candidato[]>('/api/candidatos');
}
