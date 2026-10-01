import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import type { StatusCandidatura } from '@/features/candidato/api';
import type { StatusVaga } from './types';

export interface ItemGrafico {
  rotulo: string;
  valor: number;
  /** Cor da barra; sem cor, o gráfico usa COR_SERIE. */
  cor?: string;
}

export const COR_SERIE = '#1f6fb2';

const ETAPAS: StatusCandidatura[] = ['inscrito', 'em_analise', 'aprovado', 'reprovado'];

const COR_ETAPA: Record<StatusCandidatura, string> = {
  inscrito:   '#2563eb',
  em_analise: '#ca8a04',
  aprovado:   '#059669',
  reprovado:  '#dc2626',
};

const STATUS_VAGA: Record<StatusVaga, { rotulo: string; cor: string }> = {
  ativa:     { rotulo: 'Ativa',     cor: '#059669' },
  pausada:   { rotulo: 'Pausada',   cor: '#ca8a04' },
  arquivada: { rotulo: 'Arquivada', cor: '#64748b' },
};

export const itensFunil = (porStatus: Record<StatusCandidatura, number>): ItemGrafico[] =>
  ETAPAS.map(s => ({ rotulo: STATUS_CANDIDATURA_CONFIG[s].label, valor: porStatus[s], cor: COR_ETAPA[s] }));

export const itensStatusVaga = (porStatus: Record<StatusVaga, number>): ItemGrafico[] =>
  (Object.keys(STATUS_VAGA) as StatusVaga[]).map(s => ({ rotulo: STATUS_VAGA[s].rotulo, valor: porStatus[s], cor: STATUS_VAGA[s].cor }));

export const rotuloStatusVaga = (status: string) => STATUS_VAGA[status as StatusVaga]?.rotulo ?? status;
