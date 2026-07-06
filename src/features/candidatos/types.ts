export interface Candidato {
  id: string;
  _id?: string;
  nome: string;
  email: string;
  tipos_permissao?: string[];
  status_ativo?: boolean;
  createdAt?: string;
}
