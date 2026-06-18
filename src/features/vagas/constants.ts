export const AREA_BADGE: Record<string, string> = {
  TI:             'bg-blue-50 text-blue-700',
  ENGENHARIA:     'bg-blue-50 text-blue-700',
  RH:             'bg-purple-50 text-purple-700',
  MARKETING:      'bg-orange-50 text-orange-700',
  FINANCEIRO:     'bg-green-50 text-green-700',
  COMERCIAL:      'bg-yellow-50 text-yellow-700',
  SALES:          'bg-yellow-50 text-yellow-700',
  OPERACOES:      'bg-red-50 text-red-700',
  JURIDICO:       'bg-indigo-50 text-indigo-700',
  ADMINISTRATIVO: 'bg-gray-50 text-gray-700',
  PRODUTO:        'bg-teal-50 text-teal-700',
  DESIGN:         'bg-pink-50 text-pink-700',
  OUTROS:         'bg-gray-50 text-gray-600',
};

export const STATUS_CONFIG: Record<string, { dot: string; label: string; border: string }> = {
  ativa:     { dot: 'bg-emerald-500', label: 'STATUS: PUBLICADA & ATIVA',    border: 'border-l-emerald-500' },
  aberta:    { dot: 'bg-emerald-500', label: 'STATUS: PUBLICADA & ATIVA',    border: 'border-l-emerald-500' },
  pausada:   { dot: 'bg-yellow-500',  label: 'STATUS: PAUSADA PARA REVISÃO', border: 'border-l-yellow-500'  },
  arquivada: { dot: 'bg-gray-400',    label: 'STATUS: FINALIZADA',           border: 'border-l-gray-400'    },
  fechada:   { dot: 'bg-gray-400',    label: 'STATUS: FINALIZADA',           border: 'border-l-gray-400'    },
  inativa:   { dot: 'bg-gray-400',    label: 'STATUS: INATIVA',              border: 'border-l-gray-400'    },
};

export const AREAS = [
  'TI', 'RH', 'MARKETING', 'FINANCEIRO', 'COMERCIAL',
  'OPERACOES', 'JURIDICO', 'ADMINISTRATIVO', 'OUTROS',
];

export const STATUSES = ['ativa', 'pausada', 'arquivada'];

export const FINISHED_STATUSES = ['arquivada', 'fechada', 'inativa'];
