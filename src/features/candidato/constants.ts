import type { StatusCandidatura } from './api';

export const STATUS_CANDIDATURA_CONFIG: Record<
  StatusCandidatura,
  { label: string; badge: string; dot: string }
> = {
  inscrito:   { label: 'Inscrito',   badge: 'bg-blue-50 text-blue-600',     dot: 'bg-blue-400'    },
  em_analise: { label: 'Em análise', badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400'  },
  aprovado:   { label: 'Aprovado',   badge: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
  reprovado:  { label: 'Reprovado',  badge: 'bg-red-50 text-red-600',       dot: 'bg-red-400'     },
};
