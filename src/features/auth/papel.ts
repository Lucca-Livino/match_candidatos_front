import type { AuthUser, Papel } from './types';

export type Area = 'recrutador' | 'candidato' | 'suporte' | 'admin' | 'impressao';

// O administrador tem área própria: ele cuida das contas internas e não opera
// vagas nem candidaturas, assim como o suporte não opera.
const AREA_RECRUTADOR: Papel[] = ['recrutador'];

// Ficha de impressão: quem lida com candidatos. O candidato e o admin ficam de fora.
const AREA_IMPRESSAO: Papel[] = ['recrutador', 'suporte'];

export function papelDe(user: AuthUser | null): Papel | null {
  return user?.tipos_permissao?.[0] ?? null;
}

export function isCandidato(user: AuthUser | null): boolean {
  return papelDe(user) === 'candidato';
}

export function homeDoPapel(papel: Papel | null): string {
  if (papel === 'candidato') return '/candidato';
  if (papel === 'suporte') return '/suporte/configuracao';
  if (papel === 'administrador') return '/admin/usuarios';
  return '/dashboard';
}

export function loginDoPapel(papel: Papel | null): string {
  return papel === 'candidato' ? '/candidato/login' : '/login';
}

// Cada área tem sua própria rota de perfil: o router monta uma árvore por
// área, e um path único compartilhado casaria sempre com a primeira delas,
// jogando recrutador e suporte para dentro da área do candidato.
export function perfilDoPapel(papel: Papel | null): string {
  if (papel === 'candidato') return '/perfil';
  if (papel === 'suporte') return '/suporte/perfil';
  if (papel === 'administrador') return '/admin/perfil';
  return '/recrutador/perfil';
}

export function papelPermitidoNaArea(papel: Papel | null, area: Area): boolean {
  if (!papel) return false;
  if (area === 'candidato') return papel === 'candidato';
  if (area === 'suporte') return papel === 'suporte';
  if (area === 'admin') return papel === 'administrador';
  if (area === 'impressao') return AREA_IMPRESSAO.includes(papel);
  return AREA_RECRUTADOR.includes(papel);
}
