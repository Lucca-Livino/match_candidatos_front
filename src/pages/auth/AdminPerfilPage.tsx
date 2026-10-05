import { ADMIN_NAV_ITEMS } from '@/lib/nav';
import { PerfilInternoPage } from './PerfilInternoPage';

export default function AdminPerfilPage() {
  return (
    <PerfilInternoPage
      navItems={ADMIN_NAV_ITEMS}
      descricao="Seus dados de acesso e contato como administrador."
    />
  );
}
