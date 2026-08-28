import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SUPORTE_NAV_ITEMS } from '@/lib/nav';
import { ConfiguracaoForm } from '@/features/configuracao';

export default function SuporteConfiguracaoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={SUPORTE_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Configuração da triagem</h1>
        <p className="text-[14px] text-on-surface-variant mb-8">
          Parâmetros da integração de análise automática de candidaturas.
        </p>

        <ConfiguracaoForm />
      </main>

      <Footer />
    </div>
  );
}
