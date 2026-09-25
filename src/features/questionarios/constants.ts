import type { TipoResposta } from './types';

export const TIPOS_RESPOSTA: { value: TipoResposta; label: string }[] = [
  { value: 'multipla_escolha', label: 'Múltipla escolha' },
  { value: 'verdadeiro_falso', label: 'Verdadeiro ou falso' },
  { value: 'dissertativa',     label: 'Dissertativa'       },
];

export const TIPO_RESPOSTA_LABEL: Record<TipoResposta, string> = {
  multipla_escolha: 'Múltipla escolha',
  verdadeiro_falso: 'Verdadeiro ou falso',
  dissertativa:     'Dissertativa',
};

/** Opções fixas geradas para perguntas verdadeiro/falso. */
export const OPCOES_VF: readonly string[] = ['Verdadeiro', 'Falso'];
