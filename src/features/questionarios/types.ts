export type TipoResposta = 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso';

/** Opção de resposta como vem da API. */
export interface OpcaoResposta {
  id: string;
  perguntaId?: string;
  texto: string;
  correta: 0 | 1;
  ordem: number;
}

/** Pergunta com opções aninhadas (retorno de GET /questionario/:id). */
export interface Pergunta {
  id: string;
  questionarioId?: string;
  enunciado: string;
  tipoResposta: TipoResposta;
  peso: number;
  obrigatoria: 0 | 1;
  ordem: number;
  opcaoResposta: OpcaoResposta[];
}

/** Questionário com perguntas aninhadas. */
export interface Questionario {
  id: string;
  vagaId: string;
  criadoPor: string;
  titulo: string;
  instrucoes: string;
  ativo: 0 | 1;
  perguntas: Pergunta[];
}

/* ---------- Formulário (estado local do editor) ---------- */

/** Opção no editor. `id` ausente = ainda não existe na API. */
export interface OpcaoForm {
  id?: string;
  texto: string;
  correta: boolean;
}

/** Pergunta no editor. `id` ausente = nova. */
export interface PerguntaForm {
  id?: string;
  enunciado: string;
  tipoResposta: TipoResposta;
  peso: number;
  obrigatoria: boolean;
  opcoes: OpcaoForm[];
}

/** Questionário no editor. `id` ausente = ainda não criado. */
export interface QuestionarioForm {
  id?: string;
  titulo: string;
  instrucoes: string;
  ativo: boolean;
  perguntas: PerguntaForm[];
}

/* ---------- Resposta do candidato ---------- */

/** Resposta de uma pergunta enviada ao backend. */
export interface RespostaPerguntaInput {
  perguntaId: string;
  textoResposta?: string;
  opcaoRespostaIds?: string[];
}

/** Estado local da resposta do candidato por pergunta. */
export interface RespostaLocal {
  opcaoId: string;
  texto: string;
}
