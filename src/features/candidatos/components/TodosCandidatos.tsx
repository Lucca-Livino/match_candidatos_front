import { useMemo, useState } from 'react';
import { Users, Mail, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NAV_ITEMS } from '@/lib/nav';
import { useCandidatos } from '../hooks/useCandidatos';

export function TodosCandidatos() {
  const { candidatos, loading, error } = useCandidatos();
  const [q, setQ] = useState('');

  // Só usuários com papel de candidato.
  const somenteCandidatos = useMemo(
    () => candidatos.filter(c => (c.tipos_permissao ?? ['candidato']).includes('candidato')),
    [candidatos],
  );

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
        <section className="bg-[#1a2b45] text-white">
          <div className="container mx-auto px-8 max-w-[1400px] py-12">
            <h1 className="text-[36px] font-black tracking-tight mb-2 !text-white">Candidatos</h1>
            <p className="text-[14px] text-white/70 max-w-[480px] leading-relaxed">
              Todos os candidatos cadastrados na plataforma.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-8 max-w-[1400px] py-10">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="relative w-full max-w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="w-full h-10 pl-9 pr-4 rounded-md border border-outline-variant bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {loading ? '—' : filtrados.length} candidato{filtrados.length === 1 ? '' : 's'}
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
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
                <div key={c.id ?? c._id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[14px] font-bold flex-shrink-0">
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-primary truncate">{c.nome}</p>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                  </div>
                  {c.status_ativo === false && (
                    <Badge className="bg-red-50 text-red-600 border-none text-[11px]">Inativo</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
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
