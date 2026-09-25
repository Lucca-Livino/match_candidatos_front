export type Papel = 'administrador' | 'recrutador' | 'candidato' | 'suporte';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  tipos_permissao?: Papel[];
}
