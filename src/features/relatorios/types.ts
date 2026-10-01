import type { StatusCandidatura } from '@/features/candidato/api';

export type Periodo = '30d' | '90d' | '12m' | 'tudo';
export type StatusVaga = 'ativa' | 'pausada' | 'arquivada';

export interface ResumoCandidaturas {
  total: number;
  porStatus: Record<StatusCandidatura, number>;
  /** aprovado / (aprovado + reprovado); null quando nenhuma foi decidida. */
  taxaAprovacao: number | null;
}

export interface Serie {
  granularidade: 'semana' | 'mes';
  /** `inicio` em AAAA-MM-DD (UTC). */
  pontos: { inicio: string; total: number }[];
}

export interface RelatorioGeral {
  periodo: Periodo;
  geradoEm: string;
  vagas: {
    total: number;
    porStatus: Record<StatusVaga, number>;
    porArea: { area: string; total: number }[];
  };
  candidaturas: ResumoCandidaturas;
  serie: Serie;
}

export interface CandidatoRelatorio {
  /** null quando o usuário foi removido. */
  nome: string | null;
  status: StatusCandidatura;
  inscritoEm: string;
}

export interface RelatorioVaga {
  periodo: Periodo;
  geradoEm: string;
  vaga: { id: string; titulo: string; area: string; status: string; criadoEm: string | null };
  candidaturas: ResumoCandidaturas;
  serie: Serie;
  candidatos: CandidatoRelatorio[];
}
