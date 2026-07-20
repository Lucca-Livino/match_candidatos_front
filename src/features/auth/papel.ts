import type { AuthUser, Papel } from './types';

// Papéis de recrutador/admin compartilham a área do recrutador.
const AREA_RECRUTADOR: Papel[] = ['recrutador', 'administrador'];

export function papelDe(user: AuthUser | null): Papel | null {
  return user?.tipos_permissao?.[0] ?? null;
}

export function isCandidato(user: AuthUser | null): boolean {
  const papel = papelDe(user);
  return papel === 'candidato';
}

export function homeDoPapel(papel: Papel | null): string {
  return papel === 'candidato' ? '/candidato' : '/dashboard';
}

export function loginDoPapel(papel: Papel | null): string {
  return papel === 'candidato' ? '/candidato/login' : '/login';
}

export function papelPermitidoNaArea(papel: Papel | null, area: 'recrutador' | 'candidato'): boolean {
  if (!papel) return false;
  return area === 'candidato' ? papel === 'candidato' : AREA_RECRUTADOR.includes(papel);
}
