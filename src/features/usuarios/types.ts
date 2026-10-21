import type { Papel } from '@/features/auth';

export type PapelConvidavel = 'recrutador' | 'suporte';
export type SituacaoUsuario = 'pendente' | 'ativo' | 'desativado';

/** Conta interna na visão do administrador. `situacao` é derivada pela API. */
export interface UsuarioInterno {
  _id: string;
  nome: string;
  email: string;
  tipos_permissao: Papel[];
  situacao: SituacaoUsuario;
  convidadoEm?: string | null;
  ativadoEm?: string | null;
  createdAt?: string;
}

export interface FiltrosUsuarios {
  papel?: PapelConvidavel;
  situacao?: SituacaoUsuario;
  page?: number;
}

export interface PaginaUsuarios {
  docs: UsuarioInterno[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

export interface DadosConvite {
  nome: string;
  email: string;
  papel: PapelConvidavel;
}
