import type { StatusCandidatura } from './api';

export const STATUS_CANDIDATURA_CONFIG: Record<
  StatusCandidatura,
  // coluna/topo: fundo e faixa superior da coluna no kanban do recrutador.
  { label: string; badge: string; dot: string; coluna: string; topo: string }
> = {
  inscrito:   { label: 'Inscrito',   badge: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-400',    coluna: 'bg-blue-50/60',    topo: 'border-t-blue-400'    },
  em_analise: { label: 'Em análise', badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400',  coluna: 'bg-yellow-50/70',  topo: 'border-t-yellow-400'  },
  aprovado:   { label: 'Aprovado',   badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400', coluna: 'bg-emerald-50/70', topo: 'border-t-emerald-400' },
  reprovado:  { label: 'Reprovado',  badge: 'bg-red-50 text-red-700',       dot: 'bg-red-400',     coluna: 'bg-red-50/60',     topo: 'border-t-red-400'     },
};
