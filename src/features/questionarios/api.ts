import { request } from '@/lib/api';
import type {
  OpcaoResposta,
  Pergunta,
  Questionario,
  QuestionarioForm,
  PerguntaForm,
  RespostaPerguntaInput,
  TipoResposta,
} from './types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/* ============================================================
 * Endpoints crus
 * ========================================================== */

/** Lista questionários de uma vaga (sem perguntas aninhadas). */
export async function getQuestionariosByVaga(vagaId: string): Promise<Questionario[]> {
  const res = await request<ApiResponse<Questionario[]>>(
    `/api/questionario?vagaId=${encodeURIComponent(vagaId)}`,
  );
  return res.data ?? [];
}

/** Busca um questionário com perguntas + opções aninhadas. */
export async function getQuestionario(id: string): Promise<Questionario> {
  const res = await request<ApiResponse<Questionario>>(`/api/questionario/${id}`);
  return res.data;
}

interface CreateQuestionarioPayload {
  vagaId: string;
  criadoPor: string;
  titulo: string;
  instrucoes: string;
  ativo: 0 | 1;
}

export async function createQuestionario(payload: CreateQuestionarioPayload): Promise<Questionario> {
  const res = await request<ApiResponse<Questionario>>('/api/questionario', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateQuestionario(
  id: string,
  payload: { titulo?: string; instrucoes?: string },
): Promise<Questionario> {
  const res = await request<ApiResponse<Questionario>>(`/api/questionario/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function patchQuestionarioAtivo(id: string, ativo: 0 | 1): Promise<Questionario> {
  const res = await request<ApiResponse<Questionario>>(`/api/questionario/${id}/ativo`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo }),
  });
  return res.data;
}

export async function deleteQuestionario(id: string): Promise<void> {
  await request(`/api/questionario/${id}`, { method: 'DELETE' });
}

interface CreatePerguntaPayload {
  questionarioId: string;
  enunciado: string;
  tipoResposta: TipoResposta;
  peso: number;
  obrigatoria: 0 | 1;
  ordem: number;
}

export async function createPergunta(payload: CreatePerguntaPayload): Promise<Pergunta> {
  const res = await request<ApiResponse<Pergunta>>('/api/pergunta', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updatePergunta(
  id: string,
  payload: Partial<{ enunciado: string; tipoResposta: TipoResposta; peso: number; obrigatoria: 0 | 1 }>,
): Promise<Pergunta> {
  const res = await request<ApiResponse<Pergunta>>(`/api/pergunta/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletePergunta(id: string): Promise<void> {
  await request(`/api/pergunta/${id}`, { method: 'DELETE' });
}

export async function reordenarPerguntas(payload: {
  questionarioId: string;
  perguntas: { id: string; ordem: number }[];
}): Promise<void> {
  await request('/api/pergunta/reordenar', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function addOpcao(
  perguntaId: string,
  payload: { texto: string; correta: 0 | 1; ordem: number },
): Promise<OpcaoResposta> {
  const res = await request<ApiResponse<OpcaoResposta>>(`/api/pergunta/${perguntaId}/opcao`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateOpcao(
  perguntaId: string,
  opcaoId: string,
  payload: Partial<{ texto: string; correta: 0 | 1; ordem: number }>,
): Promise<OpcaoResposta> {
  const res = await request<ApiResponse<OpcaoResposta>>(
    `/api/pergunta/${perguntaId}/opcao/${opcaoId}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function removeOpcao(perguntaId: string, opcaoId: string): Promise<void> {
  await request(`/api/pergunta/${perguntaId}/opcao/${opcaoId}`, { method: 'DELETE' });
}

/* ============================================================
 * Mapeamento API -> formulário
 * ========================================================== */

export function toQuestionarioForm(q: Questionario): QuestionarioForm {
  return {
    id: q.id,
    titulo: q.titulo,
    instrucoes: q.instrucoes ?? '',
    ativo: q.ativo === 1,
    perguntas: (q.perguntas ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((p) => ({
        id: p.id,
        enunciado: p.enunciado,
        tipoResposta: p.tipoResposta,
        peso: p.peso,
        obrigatoria: p.obrigatoria === 1,
        opcoes: (p.opcaoResposta ?? [])
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map((o) => ({ id: o.id, texto: o.texto, correta: o.correta === 1, ordem: o.ordem })),
      })),
  };
}

/**
 * Carrega o questionário de uma vaga (com perguntas) já no formato do formulário.
 * Retorna null se a vaga ainda não tem questionário.
 */
export async function carregarQuestionarioDaVaga(vagaId: string): Promise<QuestionarioForm | null> {
  const lista = await getQuestionariosByVaga(vagaId);
  if (lista.length === 0) return null;
  const completo = await getQuestionario(lista[0].id);
  return toQuestionarioForm(completo);
}

/**
 * Carrega o questionário ATIVO de uma vaga com perguntas + opções (visão do candidato).
 * Retorna null se a vaga não tem questionário ativo.
 */
export async function getQuestionarioAtivoDaVaga(vagaId: string): Promise<Questionario | null> {
  const lista = await getQuestionariosByVaga(vagaId);
  const ativo = lista.find((q) => q.ativo === 1) ?? null;
  if (!ativo) return null;
  return getQuestionario(ativo.id);
}

/* ============================================================
 * Resposta do candidato (iniciar -> responder -> finalizar)
 * ========================================================== */

interface RespostaQuestionario {
  id: string;
  questionarioId: string;
  usuarioId: string;
  status: 'em_andamento' | 'finalizado';
}

export async function iniciarResposta(
  questionarioId: string,
  usuarioId: string,
): Promise<RespostaQuestionario> {
  const res = await request<ApiResponse<RespostaQuestionario>>('/api/resposta-questionario/iniciar', {
    method: 'POST',
    body: JSON.stringify({ questionarioId, usuarioId }),
  });
  return res.data;
}

export async function responderQuestionario(
  respostaQuestionarioId: string,
  respostas: RespostaPerguntaInput[],
): Promise<void> {
  await request(`/api/resposta-questionario/${respostaQuestionarioId}/responder`, {
    method: 'POST',
    body: JSON.stringify({ respostas }),
  });
}

export async function finalizarResposta(respostaQuestionarioId: string): Promise<void> {
  await request(`/api/resposta-questionario/${respostaQuestionarioId}/finalizar`, {
    method: 'PATCH',
  });
}

/**
 * Orquestra o envio completo das respostas do candidato:
 * iniciar -> responder -> finalizar. Retorna o id da resposta.
 */
export async function enviarRespostasQuestionario(params: {
  questionarioId: string;
  usuarioId: string;
  respostas: RespostaPerguntaInput[];
}): Promise<string> {
  const resposta = await iniciarResposta(params.questionarioId, params.usuarioId);
  await responderQuestionario(resposta.id, params.respostas);
  await finalizarResposta(resposta.id);
  return resposta.id;
}

/* ============================================================
 * Orquestrador: salva o questionário completo respeitando as
 * regras do backend (ordem única, 1 opção correta, reorder em bloco).
 * ========================================================== */

async function reconcileOpcoes(
  perguntaId: string,
  pergunta: PerguntaForm,
  original: PerguntaForm | undefined,
): Promise<void> {
  // Dissertativa não tem opções — o PUT da pergunta já as removeu no backend.
  if (pergunta.tipoResposta === 'dissertativa') return;

  const originalOpcoes = original?.opcoes ?? [];
  const idsForm = new Set(pergunta.opcoes.filter((o) => o.id).map((o) => o.id));

  // Deletar opções removidas.
  for (const o of originalOpcoes) {
    if (o.id && !idsForm.has(o.id)) {
      await removeOpcao(perguntaId, o.id);
    }
  }

  // Próxima ordem livre (não há reorder de opção; ordens antigas ficam estáveis).
  let proximaOrdem = originalOpcoes.reduce((max, o) => Math.max(max, o.ordem ?? 0), 0) + 1;

  // Fase 1: cria/atualiza tudo como correta=0 (evita conflito de "já existe correta").
  const resolvidas: { id: string; correta: boolean }[] = [];
  for (const o of pergunta.opcoes) {
    const texto = o.texto.trim();
    if (o.id) {
      await updateOpcao(perguntaId, o.id, { texto, correta: 0 });
      resolvidas.push({ id: o.id, correta: o.correta });
    } else {
      const criada = await addOpcao(perguntaId, { texto, correta: 0, ordem: proximaOrdem++ });
      resolvidas.push({ id: criada.id, correta: o.correta });
    }
  }

  // Fase 2: marca a única correta.
  const correta = resolvidas.find((o) => o.correta);
  if (correta) {
    await updateOpcao(perguntaId, correta.id, { correta: 1 });
  }
}

interface SalvarParams {
  vagaId: string;
  criadoPor: string;
  form: QuestionarioForm;
  original: QuestionarioForm | null;
}

/**
 * Cria ou atualiza o questionário inteiro (header + perguntas + opções).
 * Idempotente por reconciliação: cria novos, atualiza existentes, remove ausentes.
 */
export async function salvarQuestionarioCompleto({
  vagaId,
  criadoPor,
  form,
  original,
}: SalvarParams): Promise<void> {
  // 1. Header do questionário.
  let questionarioId: string;
  if (!form.id) {
    const criado = await createQuestionario({
      vagaId,
      criadoPor,
      titulo: form.titulo.trim(),
      instrucoes: form.instrucoes.trim(),
      ativo: form.ativo ? 1 : 0,
    });
    questionarioId = criado.id;
  } else {
    questionarioId = form.id;
    await updateQuestionario(questionarioId, {
      titulo: form.titulo.trim(),
      instrucoes: form.instrucoes.trim(),
    });
    if (!original || original.ativo !== form.ativo) {
      await patchQuestionarioAtivo(questionarioId, form.ativo ? 1 : 0);
    }
  }

  const originalPerguntas = original?.perguntas ?? [];

  // 2a. Deletar perguntas removidas.
  const idsForm = new Set(form.perguntas.filter((p) => p.id).map((p) => p.id));
  for (const p of originalPerguntas) {
    if (p.id && !idsForm.has(p.id)) {
      await deletePergunta(p.id);
    }
  }

  // 2b. Upsert perguntas. Ordem NÃO é mexida aqui (evita colisão de índice único);
  //     novas nascem com ordem temporária alta e são normalizadas no reorder final.
  const resolvidas: { id: string; pergunta: PerguntaForm; original?: PerguntaForm }[] = [];
  let ordemTemp = 100000;
  for (const p of form.perguntas) {
    const orig = originalPerguntas.find((op) => op.id && op.id === p.id);
    if (p.id) {
      await updatePergunta(p.id, {
        enunciado: p.enunciado.trim(),
        tipoResposta: p.tipoResposta,
        peso: p.peso,
        obrigatoria: p.obrigatoria ? 1 : 0,
      });
      resolvidas.push({ id: p.id, pergunta: p, original: orig });
    } else {
      const criada = await createPergunta({
        questionarioId,
        enunciado: p.enunciado.trim(),
        tipoResposta: p.tipoResposta,
        peso: p.peso,
        obrigatoria: p.obrigatoria ? 1 : 0,
        ordem: ++ordemTemp,
      });
      resolvidas.push({ id: criada.id, pergunta: p });
    }
  }

  // 2c. Reordenar em bloco na ordem visual do formulário.
  if (resolvidas.length > 0) {
    await reordenarPerguntas({
      questionarioId,
      perguntas: resolvidas.map((r, i) => ({ id: r.id, ordem: i + 1 })),
    });
  }

  // 3. Opções de cada pergunta.
  for (const r of resolvidas) {
    await reconcileOpcoes(r.id, r.pergunta, r.original);
  }
}
