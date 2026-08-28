import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SUPORTE_NAV_ITEMS } from '@/lib/nav';
import { PainelAvaliacoes } from '@/features/avaliacoes';

export default function SuporteAvaliacoesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={SUPORTE_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[1400px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Avaliações da IA</h1>
        <p className="text-[14px] text-on-surface-variant mb-8 max-w-[720px]">
          Acompanhamento da triagem automática. O score e o limiar aparecem só aqui — o
          recrutador vê apenas a fila: candidaturas compatíveis entram direto em análise.
        </p>

        <PainelAvaliacoes />
      </main>

      <Footer />
    </div>
  );
}
