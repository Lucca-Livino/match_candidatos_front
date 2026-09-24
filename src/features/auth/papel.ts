import type { AuthUser, Papel } from './types';

export type Area = 'recrutador' | 'candidato' | 'suporte' | 'impressao';

// Papéis de recrutador/admin compartilham a área do recrutador.
const AREA_RECRUTADOR: Papel[] = ['recrutador', 'administrador'];

// Ficha de impressão: os três papéis internos. O candidato fica de fora.
const AREA_IMPRESSAO: Papel[] = [...AREA_RECRUTADOR, 'suporte'];

export function papelDe(user: AuthUser | null): Papel | null {
  return user?.tipos_permissao?.[0] ?? null;
}

export function isCandidato(user: AuthUser | null): boolean {
  return papelDe(user) === 'candidato';
}

export function homeDoPapel(papel: Papel | null): string {
  if (papel === 'candidato') return '/candidato';
  if (papel === 'suporte') return '/suporte/configuracao';
  return '/dashboard';
}

export function loginDoPapel(papel: Papel | null): string {
  return papel === 'candidato' ? '/candidato/login' : '/login';
}

export function papelPermitidoNaArea(papel: Papel | null, area: Area): boolean {
  if (!papel) return false;
  if (area === 'candidato') return papel === 'candidato';
  if (area === 'suporte') return papel === 'suporte';
  if (area === 'impressao') return AREA_IMPRESSAO.includes(papel);
  return AREA_RECRUTADOR.includes(papel);
}
