import type { StatusCandidatura } from '@/features/candidato/api';
import type { Formacao, Experiencia, Habilidade, Certificacao } from '@/features/perfil/types';
import type { TipoResposta } from '@/features/questionarios';

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
  candidato: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    linkedin?: string;
    cidade?: string;
  } | null;
}

/** Ficha de impressão. Montada pela API campo a campo: nunca traz dados da triagem. */
export interface FichaCandidatura {
  candidato: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    linkedin: string;
    cidade: string;
  };
  vaga: { id: string; titulo: string; area: string };
  candidatura: { status: StatusCandidatura; criadoEm: string | null };
  curriculo: {
    habilidades: Omit<Habilidade, 'usuarioId'>[];
    formacoes: Omit<Formacao, 'usuarioId'>[];
    experiencias: Omit<Experiencia, 'usuarioId' | 'mesesDuracao'>[];
    certificacoes: Omit<Certificacao, 'usuarioId'>[];
  };
  questionario: {
    titulo: string | null;
    respostas: {
      perguntaId: string;
      enunciado: string;
      tipoResposta: TipoResposta;
      textoResposta: string;
      opcoesSelecionadas: string[];
    }[];
  };
}
