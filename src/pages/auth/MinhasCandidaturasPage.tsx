import { ClipboardList, Construction } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';

export default function MinhasCandidaturasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md w-full mx-8">
          <div className="flex justify-center gap-3 mb-5 text-secondary">
            <ClipboardList className="h-8 w-8 opacity-60" />
            <Construction className="h-8 w-8 opacity-60" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Minhas Candidaturas</h2>
          <p className="text-[14px] text-on-surface-variant">
            Em breve você poderá acompanhar seus processos seletivos aqui.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
