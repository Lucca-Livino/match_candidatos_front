import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pagination } from '@/components/layout/pagination';
import { cn } from '@/lib/utils';
import { getVagasPaginadas } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';
import { AREAS } from '@/features/vagas/constants';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';
import { VagaCandidatoCard } from './VagaCandidatoCard';

const LIMIT = 9;
const TODAS = '';

export function CandidatoVagas() {
  const [vagas, setVagas]           = useState<Vaga[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs]   = useState(0);
  const [q, setQ]                   = useState('');
  const [area, setArea]             = useState(TODAS);

  const fetchVagas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVagasPaginadas(page, LIMIT, { area, status: 'ativa', q });
      setVagas(res.docs ?? []);
      setTotalPages(res.totalPages);
      setTotalDocs(res.totalDocs);
    } catch {
      setVagas([]);
    } finally {
      setLoading(false);
    }
  }, [page, area, q]);

  useEffect(() => { fetchVagas(); }, [fetchVagas]);
  useEffect(() => { setPage(1); }, [area, q]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      {/* Navegação de áreas + busca (sticky) */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide border-b border-gray-50">
          <div className="flex gap-1 px-8 pt-3 pb-0 min-w-max">
            {[{ label: 'Todas', value: TODAS }, ...AREAS.map(a => ({ label: a, value: a }))].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setArea(value)}
                className={cn(
                  'px-4 py-2 text-[13px] font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap',
                  area === value
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-gray-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-3 flex items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por título ou palavra-chave..."
              className="pl-10 rounded-xl h-10 border-outline-variant bg-[#f8f9fc] text-[13px]"
            />
          </div>
          {!loading && (
            <span className="text-[13px] text-on-surface-variant whitespace-nowrap">
              {totalDocs} {totalDocs === 1 ? 'vaga' : 'vagas'}
            </span>
          )}
        </div>
      </div>

      <main className="flex-grow container mx-auto px-8 max-w-[1400px] py-8">
        {loading ? (
          <SkeletonGrid />
        ) : vagas.length === 0 ? (
          <EmptyState onClear={() => { setQ(''); setArea(TODAS); }} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vagas.map(v => (
                <VagaCandidatoCard key={v.id} vaga={v} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full rounded-xl mt-2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
      <p className="text-[15px] font-medium text-primary mb-1">Nenhuma vaga encontrada</p>
      <p className="text-[13px] text-on-surface-variant mb-5">
        Tente ajustar os filtros ou buscar por outro termo.
      </p>
      <Button variant="outline" size="sm" className="rounded-xl text-[13px]" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}
