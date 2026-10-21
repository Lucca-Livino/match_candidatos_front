import type { GrauAcademico, NivelHabilidade, SituacaoFormacao } from './types';

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

export const SITUACAO_OPTIONS: { value: SituacaoFormacao; label: string }[] = [
  { value: 'cursando',   label: 'Cursando'   },
  { value: 'concluido',  label: 'Concluído'  },
  { value: 'trancado',   label: 'Trancado'   },
  { value: 'incompleto', label: 'Incompleto' },
];

export const SITUACAO_LABEL: Record<SituacaoFormacao, string> = Object.fromEntries(
  SITUACAO_OPTIONS.map(o => [o.value, o.label]),
) as Record<SituacaoFormacao, string>;

/** Mesma regra da API: nessas situações o ano final é obrigatório. */
export const SITUACOES_COM_ANO_CONCLUSAO: SituacaoFormacao[] = ['cursando', 'concluido'];

/** Ex.: "2022 – previsão 2027", "2018 – 2022", "2020". */
export function periodoFormacao(anoInicio: number, anoConclusao: number | null, situacao: string): string {
  if (!anoConclusao) return String(anoInicio);
  return situacao === 'cursando'
    ? `${anoInicio} – previsão ${anoConclusao}`
    : `${anoInicio} – ${anoConclusao}`;
}

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
