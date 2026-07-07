import type { GrauAcademico, NivelHabilidade } from './types';

export const GRAU_OPTIONS: { value: GrauAcademico; label: string }[] = [
  { value: 'tecnico',       label: 'Técnico'        },
  { value: 'graduacao',     label: 'Graduação'      },
  { value: 'pos_graduacao', label: 'Pós-graduação'  },
  { value: 'mestrado',      label: 'Mestrado'       },
  { value: 'doutorado',     label: 'Doutorado'      },
];

export const GRAU_LABEL: Record<GrauAcademico, string> = Object.fromEntries(
  GRAU_OPTIONS.map(o => [o.value, o.label]),
) as Record<GrauAcademico, string>;

export const NIVEL_OPTIONS: { value: NivelHabilidade; label: string }[] = [
  { value: 'basico',        label: 'Básico'         },
  { value: 'intermediario', label: 'Intermediário'  },
  { value: 'avancado',      label: 'Avançado'       },
  { value: 'especialista',  label: 'Especialista'   },
];

export const NIVEL_LABEL: Record<NivelHabilidade, string> = Object.fromEntries(
  NIVEL_OPTIONS.map(o => [o.value, o.label]),
) as Record<NivelHabilidade, string>;

export const NIVEL_BADGE: Record<NivelHabilidade, string> = {
  basico:        'bg-gray-100 text-gray-600',
  intermediario: 'bg-blue-50 text-blue-600',
  avancado:      'bg-violet-50 text-violet-600',
  especialista:  'bg-emerald-50 text-emerald-600',
};
