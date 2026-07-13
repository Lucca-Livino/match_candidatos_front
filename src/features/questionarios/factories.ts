import type { PerguntaForm, QuestionarioForm } from './types';

export function emptyPerguntaForm(): PerguntaForm {
  return {
    enunciado: '',
    tipoResposta: 'multipla_escolha',
    peso: 1,
    obrigatoria: true,
    opcoes: [
      { texto: '', correta: true },
      { texto: '', correta: false },
    ],
  };
}

export function emptyQuestionarioForm(): QuestionarioForm {
  return { titulo: '', instrucoes: '', ativo: true, perguntas: [] };
}
