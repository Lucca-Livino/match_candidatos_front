import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ADMIN_NAV_ITEMS } from '@/lib/nav';
import { PainelUsuarios } from '@/features/usuarios';

export default function AdminUsuariosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={ADMIN_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[1400px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Usuários</h1>
        <p className="text-[14px] text-on-surface-variant mb-8 max-w-[720px]">
          Recrutadores e suporte entram por convite: a pessoa recebe um e-mail e define a própria senha.
          Desativar bloqueia o acesso sem apagar o histórico; excluir remove a conta.
        </p>

        <PainelUsuarios />
      </main>

      <Footer />
    </div>
  );
}
