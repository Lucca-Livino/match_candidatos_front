import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { papelDe } from '@/features/auth';
import { DadosSection, ExcluirContaSection } from '@/features/perfil';

interface NavItem {
  label: string;
  path: string;
}

interface PerfilInternoPageProps {
  navItems: readonly NavItem[];
  descricao: string;
}

/**
 * Perfil dos papéis internos (recrutador, administrador, suporte). Diferente do
 * perfil do candidato, não tem currículo: essas contas são criadas pelo admin e
 * só têm dados de usuário — identificação, contato e acesso.
 */
export function PerfilInternoPage({ navItems, descricao }: PerfilInternoPageProps) {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={navItems} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Meu Perfil</h1>
        <p className="text-[14px] text-on-surface-variant mb-8">{descricao}</p>

        {loading || !user ? (
          <p className="text-[14px] text-on-surface-variant">Carregando…</p>
        ) : (
          <div className="space-y-5">
            <DadosSection userId={user.id} />
            <ExcluirContaSection email={user.email} papel={papelDe(user)} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
