import type { QuestionarioForm } from '@/features/questionarios';
import type { Criterio, Vaga, VagaPayload } from './types';

const SUFIXO_COPIA = ' (cópia)';
// Mesmo limite do model Vaga.titulo na API.
const TITULO_MAX = 180;

export function tituloDaCopia(titulo: string): string {
  return titulo.trim().slice(0, TITULO_MAX - SUFIXO_COPIA.length) + SUFIXO_COPIA;
}

function copiarCriterio(c: Criterio): Criterio {
  return {
    nome: c.nome,
    tipo_criterio: c.tipo_criterio,
    peso_percentual: c.peso_percentual,
    obrigatorio: c.obrigatorio,
    descricao: c.descricao ?? '',
    ...(c.requisito ? { requisito: { ...c.requisito } } : {}),
  };
}

// Sem `_id` nos critérios: a cópia é uma vaga nova e o servidor gera os seus.
export function prepararVagaCopia(vaga: Vaga): Partial<VagaPayload> {
  return {
    titulo: tituloDaCopia(vaga.titulo),
    area: vaga.area ?? '',
    descricao: vaga.descricao ?? '',
    requisitos_gerais: vaga.requisitos_gerais ?? '',
    status: 'ativa',
    criterio_vaga: (vaga.criterio_vaga ?? []).map(copiarCriterio),
  };
}

// Sem ids nem ordem: `salvarQuestionarioCompleto` trata tudo como novo e cria
// questionário, perguntas e opções próprios da cópia.
export function prepararQuestionarioCopia(q: QuestionarioForm): QuestionarioForm {
  return {
    titulo: q.titulo,
    instrucoes: q.instrucoes,
    ativo: q.ativo,
    perguntas: q.perguntas.map((p) => ({
      enunciado: p.enunciado,
      tipoResposta: p.tipoResposta,
      peso: p.peso,
      obrigatoria: p.obrigatoria,
      opcoes: p.opcoes.map((o) => ({ texto: o.texto, correta: o.correta })),
    })),
  };
}
