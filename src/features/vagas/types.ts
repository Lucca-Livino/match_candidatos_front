export interface Vaga {
  id: string;
  _id?: string;
  titulo: string;
  descricao?: string;
  requisitos_gerais?: string;
  area?: string;
  localizacao?: string;
  salario?: number;
  status?: string;
  criadoEm?: string;
  totalCandidatos?: number;
  criterio_vaga?: Criterio[];
}

export interface Criterio {
  _id?: string;
  nome: string;
  tipo_criterio: 'skill_tecnica' | 'formacao' | 'experiencia' | 'certificacao';
  peso_percentual: number;
  obrigatorio: boolean;
  descricao?: string;
}

export interface VagaPayload {
  titulo: string;
  area: string;
  descricao: string;
  requisitos_gerais?: string;
  status: string;
  criterio_vaga: Criterio[];
}

export interface VagasPaginadasResult {
  docs: Vaga[];
  totalDocs: number;
  totalPages: number;
  page: number;
}
