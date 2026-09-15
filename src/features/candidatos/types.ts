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
  /** 1 = compatível, 0 = incompatível. O score bruto nunca é enviado pela API. */
  compativel?: number;
  motivoIncompat_?: string;
  justificativa?: string;
  /** null quando ainda não foi avaliada (IA indisponível ou triagem desligada). */
  avaliadoEm?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  candidato: { id: string; nome: string; email: string } | null;
}
