import { NAV_ITEMS } from '@/lib/nav';
import { PerfilInternoPage } from './PerfilInternoPage';

export default function RecrutadorPerfilPage() {
  return (
    <PerfilInternoPage
      navItems={NAV_ITEMS}
      descricao="Seus dados de acesso e contato dentro da área de recrutamento."
    />
  );
}
