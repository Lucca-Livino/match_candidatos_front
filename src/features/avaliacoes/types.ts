/**
 * Avaliação na visão do SUPORTE. É a única saída da API que traz `scoreIA` e
 * `limiteAplicado` — existe para calibrar o modelo. O recrutador não tem
 * caminho para estes campos.
 */
export interface AvaliacaoAuditoria {
  id: string;
  usuarioId: string;
  vagaId: string;
  status: 'inscrito' | 'em_analise' | 'aprovado' | 'reprovado';
  movidoPor: string;
  compativel?: number;
  /** null enquanto a triagem não rodou. É o que marca uma pendência. */
  avaliadoEm?: string | null;
  scoreIA?: number | null;
  limiteAplicado?: number | null;
  versaoModelo?: string | null;
  justificativa?: string;
  motivoIncompat_?: string;
  criadoEm?: string;
  candidato: { nome: string; email: string } | null;
  vaga: { titulo: string } | null;
}

export interface FiltrosAuditoria {
  apenasPendentes?: boolean;
}
