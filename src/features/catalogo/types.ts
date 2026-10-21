export type TipoCatalogo = 'habilidade' | 'area_curso' | 'area_atuacao' | 'certificacao';

export interface ItemCatalogo {
  id: string;
  tipo: TipoCatalogo;
  nome: string;
  sinonimos: string[];
  implica: string[];
  ativo: boolean;
}
