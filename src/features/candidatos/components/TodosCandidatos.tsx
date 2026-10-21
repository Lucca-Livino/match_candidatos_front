import { useMemo, useState } from 'react';
import { Users, Mail, Search, RotateCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NAV_ITEMS } from '@/lib/nav';
import { useCandidatos } from '../hooks/useCandidatos';
import { CandidatoDetalheDialog } from './CandidatoDetalheDialog';
import type { Candidato } from '../types';

export function TodosCandidatos() {
  const { somenteCandidatos, loading, error, recarregar } = useCandidatos();
  const [q, setQ] = useState('');
  const [selecionado, setSelecionado] = useState<Candidato | null>(null);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return somenteCandidatos;
    return somenteCandidatos.filter(
      c => c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo),
    );
  }, [somenteCandidatos, q]);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-8 max-w-[1400px] pt-10">
          <h1 className="text-[28px] font-black tracking-tight leading-tight text-balance text-primary mb-1">Candidatos</h1>
          <p className="text-[14px] text-on-surface-variant max-w-[480px] leading-relaxed">
            Todos os candidatos cadastrados na plataforma.
          </p>
        </section>

        <section className="container mx-auto px-8 max-w-[1400px] py-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div role="search" className="relative w-full max-w-[360px]">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="search"
                aria-label="Buscar candidatos por nome ou e-mail"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="w-full h-10 pl-9 pr-4 rounded-md border border-outline-variant bg-white text-base md:text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {loading ? '—' : filtrados.length} candidato{filtrados.length === 1 ? '' : 's'}
            </span>
          </div>

          {error && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-error-container px-4 py-3 text-[13px] text-on-error-container">
              {error}
              <Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={recarregar}>
                <RotateCw className="h-3.5 w-3.5" />
                Tentar novamente
              </Button>
            </div>
          )}

          {loading ? (
            <ListaSkeleton />
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
              <Users className="h-10 w-10 opacity-30 mb-3" />
              <p className="text-[14px]">Nenhum candidato encontrado.</p>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-md overflow-hidden divide-y divide-outline-variant">
              {filtrados.map(c => (
                <button
                  key={c.id ?? c._id}
                  type="button"
                  onClick={() => setSelecionado(c)}
                  aria-label={`Ver currículo de ${c.nome}`}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[14px] font-bold flex-shrink-0">
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-primary truncate" title={c.nome}>{c.nome}</p>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1 truncate">
                      <Mail aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate" title={c.email}>{c.email}</span>
                    </p>
                  </div>
                  {c.status_ativo === false && (
                    <Badge className="bg-error-container text-on-error-container border-none text-[11px]">Inativo</Badge>
                  )}
                  <ChevronRight aria-hidden="true" className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CandidatoDetalheDialog candidato={selecionado} onClose={() => setSelecionado(null)} />
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="bg-white border border-outline-variant rounded-md overflow-hidden divide-y divide-outline-variant">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}
