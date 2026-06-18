export interface Vaga {
  id: string;
  _id?: string;
  titulo: string;
  descricao?: string;
  area?: string;
  localizacao?: string;
  salario?: number;
  status?: string;
  criadoEm?: string;
  totalCandidatos?: number;
}

export interface VagasPaginadasResult {
  docs: Vaga[];
  totalDocs: number;
  totalPages: number;
  page: number;
}
