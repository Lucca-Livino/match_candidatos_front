export type Provedor = 'gemini';

export interface ConfiguracaoIntegracao {
  id: string;
  limiteCompatibilidade: number;
  provedor: Provedor;
  /**
   * Cascata de modelos, em ordem de uso. O índice é a posição do degrau:
   * o primeiro recebe o trabalho normal, os seguintes só entram quando a
   * cota diária do anterior se esgota. A ordem é comportamento, não
   * apresentação — reordenar muda qual modelo avalia as candidaturas.
   */
  cascata: string[];
  temperatura: number;
  ativo: boolean;
  atualizadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
  /** Status por provedor. O valor das chaves nunca trafega. */
  chavesConfiguradas: Record<Provedor, boolean>;
}

export type ConfiguracaoPatch = Partial<
  Pick<
    ConfiguracaoIntegracao,
    'limiteCompatibilidade' | 'provedor' | 'cascata' | 'temperatura' | 'ativo'
  >
>;

/** Espelha `LIMITE_DEGRAUS` do model da API. */
export const LIMITE_DEGRAUS = 4;
