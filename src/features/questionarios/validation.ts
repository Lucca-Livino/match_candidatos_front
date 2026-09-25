import type {
  Pergunta,
  QuestionarioForm,
  RespostaLocal,
  RespostaPerguntaInput,
} from './types';

/**
 * Valida o formulário do questionário antes de salvar.
 * Retorna a primeira mensagem de erro ou null se estiver válido.
 */
export function validarQuestionario(form: QuestionarioForm): string | null {
  if (form.titulo.trim().length < 3) {
    return 'O título do questionário deve ter ao menos 3 caracteres.';
  }

  if (form.perguntas.length === 0) {
    return 'Adicione ao menos uma pergunta ao questionário.';
  }

  for (let i = 0; i < form.perguntas.length; i++) {
    const p = form.perguntas[i];
    const rotulo = `Pergunta ${i + 1}`;

    if (p.enunciado.trim().length < 3) {
      return `${rotulo}: enunciado deve ter ao menos 3 caracteres.`;
    }

    if (p.tipoResposta === 'multipla_escolha') {
      if (p.opcoes.length < 2) {
        return `${rotulo}: múltipla escolha exige ao menos 2 opções.`;
      }
      if (p.opcoes.some((o) => o.texto.trim().length === 0)) {
        return `${rotulo}: preencha o texto de todas as opções.`;
      }
    }

    if (p.tipoResposta !== 'dissertativa') {
      const corretas = p.opcoes.filter((o) => o.correta).length;
      if (corretas !== 1) {
        return `${rotulo}: marque exatamente uma opção correta.`;
      }
    }
  }

  return null;
}

/* ---------- Respostas do candidato ---------- */

/**
 * Valida as respostas do candidato. Retorna a primeira mensagem de erro ou null.
 * Perguntas obrigatórias precisam de resposta; exige ao menos uma resposta no total.
 */
export function validarRespostas(
  perguntas: Pergunta[],
  respostas: Record<string, RespostaLocal>,
): string | null {
  let algumaRespondida = false;

  for (let i = 0; i < perguntas.length; i++) {
    const p = perguntas[i];
    const r = respostas[p.id];
    const respondeu =
      p.tipoResposta === 'dissertativa'
        ? Boolean(r?.texto?.trim())
        : Boolean(r?.opcaoId);

    if (respondeu) algumaRespondida = true;

    if (p.obrigatoria === 1 && !respondeu) {
      return `Pergunta ${i + 1} é obrigatória.`;
    }
  }

  if (!algumaRespondida) {
    return 'Responda ao menos uma pergunta do questionário.';
  }

  return null;
}

/** Converte o estado local de respostas no payload do backend. */
export function montarRespostas(
  perguntas: Pergunta[],
  respostas: Record<string, RespostaLocal>,
): RespostaPerguntaInput[] {
  const payload: RespostaPerguntaInput[] = [];

  for (const p of perguntas) {
    const r = respostas[p.id];
    if (!r) continue;

    if (p.tipoResposta === 'dissertativa') {
      if (r.texto?.trim()) {
        payload.push({ perguntaId: p.id, textoResposta: r.texto.trim() });
      }
    } else if (r.opcaoId) {
      payload.push({ perguntaId: p.id, opcaoRespostaIds: [r.opcaoId] });
    }
  }

  return payload;
}
