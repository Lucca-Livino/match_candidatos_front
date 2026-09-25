import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  DadosSection,
  FormacaoSection,
  ExperienciaSection,
  HabilidadesSection,
  CertificacoesSection,
} from '@/features/perfil';

export default function PerfilPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Meu Perfil</h1>
        <p className="text-[14px] text-on-surface-variant mb-8">
          Gerencie seus dados e mantenha seu currículo atualizado.
        </p>

        {loading || !user ? (
          <p className="text-[14px] text-on-surface-variant">Carregando…</p>
        ) : (
          <div className="space-y-5">
            <DadosSection userId={user.id} />
            <FormacaoSection userId={user.id} />
            <ExperienciaSection userId={user.id} />
            <HabilidadesSection userId={user.id} />
            <CertificacoesSection userId={user.id} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
