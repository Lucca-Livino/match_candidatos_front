export type GrauAcademico =
  | 'tecnico'
  | 'graduacao'
  | 'pos_graduacao'
  | 'mestrado'
  | 'doutorado';

export type NivelHabilidade =
  | 'basico'
  | 'intermediario'
  | 'avancado'
  | 'especialista';

export interface Formacao {
  id: string;
  usuarioId: string;
  instituicao: string;
  curso: string;
  grau: GrauAcademico;
  situacao: string;
  anoInicio: number;
  anoConclusao: number | null;
}

export type FormacaoPayload = Omit<Formacao, 'id' | 'usuarioId'>;

export interface Experiencia {
  id: string;
  usuarioId: string;
  empresa: string;
  cargo: string;
  descricaoAtivida_: string;
  dataInicio: string;
  dataFim: string | null;
  mesesDuracao?: number;
}

export type ExperienciaPayload = Pick<
  Experiencia,
  'empresa' | 'cargo' | 'descricaoAtivida_' | 'dataInicio' | 'dataFim'
>;

export interface Habilidade {
  id: string;
  usuarioId: string;
  habilidade: string;
  nivel: NivelHabilidade;
}

export type HabilidadePayload = Pick<Habilidade, 'habilidade' | 'nivel'>;

export interface Certificacao {
  id: string;
  usuarioId: string;
  nome: string;
  emissor: string;
  dataEmissao: string | null;
  dataExpiracao: string | null;
  codigo: string;
}

export type CertificacaoPayload = Pick<
  Certificacao,
  'nome' | 'emissor' | 'dataEmissao' | 'dataExpiracao' | 'codigo'
>;

export interface UsuarioPerfil {
  id: string;
  nome: string;
  email: string;
  tipos_permissao?: string[];
  status_ativo?: boolean;
}

export interface UsuarioUpdatePayload {
  nome?: string;
  email?: string;
  senha?: string;
}
