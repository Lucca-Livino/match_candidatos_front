import type { Criterio } from './types';

// Backend: peso_percentual e obrigatorio, numero de 1 a 100, e a soma dos
// criterios da vaga nao pode passar de 100.
// Espelha src/utils/validators/vagaValidators.js e o model Vaga na API.
export const PESO_MIN = 1;
export const PESO_MAX = 100;
export const PESO_TOTAL = 100;

// Fatia inicial de um criterio novo, quando ainda ha orcamento de sobra.
export const PESO_INICIAL = 10;

// 0 representa o campo vazio enquanto o usuario digita. Nao e valido no envio:
// validarPesos() barra antes de chegar na API.
export const PESO_VAZIO = 0;

export function somarPesos(criterios: Criterio[]): number {
  return criterios.reduce((acc, c) => acc + (Number(c.peso_percentual) || 0), 0);
}

// O criterio novo recebe o que sobra do orcamento, limitado a PESO_INICIAL,
// para que adicionar um criterio nunca estoure a soma enquanto houver espaco.
// Sem espaco algum, cai no minimo e a validacao acusa: falha visivel e melhor
// que um valor silenciosamente invalido.
export function pesoParaNovoCriterio(criterios: Criterio[]): number {
  const restante = PESO_TOTAL - somarPesos(criterios);
  return Math.max(PESO_MIN, Math.min(PESO_INICIAL, restante));
}

export function validarPesos(criterios: Criterio[]): string | null {
  const invalido = criterios.findIndex(
    c => !Number.isInteger(c.peso_percentual)
      || c.peso_percentual < PESO_MIN
      || c.peso_percentual > PESO_MAX,
  );
  if (invalido !== -1) {
    return `Critério ${invalido + 1}: informe um peso inteiro entre ${PESO_MIN} e ${PESO_MAX}.`;
  }

  const soma = somarPesos(criterios);
  if (soma > PESO_TOTAL) {
    return `A soma dos pesos é ${soma}% e não pode passar de ${PESO_TOTAL}%.`;
  }

  return null;
}
