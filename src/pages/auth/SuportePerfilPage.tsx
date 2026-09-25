import { SUPORTE_NAV_ITEMS } from '@/lib/nav';
import { PerfilInternoPage } from './PerfilInternoPage';

export default function SuportePerfilPage() {
  return (
    <PerfilInternoPage
      navItems={SUPORTE_NAV_ITEMS}
      descricao="Seus dados de acesso e contato dentro da área de suporte."
    />
  );
}
