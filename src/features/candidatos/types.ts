import type { StatusCandidatura } from '@/features/candidato/api';

export interface Candidato {
  id: string;
  _id?: string;
  nome: string;
  email: string;
  tipos_permissao?: string[];
  status_ativo?: boolean;
  createdAt?: string;
}

export interface CandidaturaVaga {
  id: string;
  usuarioId: string;
  vagaId: string;
  status: StatusCandidatura;
  compativel?: number;
  criadoEm?: string;
  atualizadoEm?: string;
  candidato: { id: string; nome: string; email: string } | null;
}
