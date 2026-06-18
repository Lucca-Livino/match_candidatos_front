import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { getVagasPaginadas } from '../api';
import type { Vaga } from '../types';
import { FINISHED_STATUSES } from '../constants';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pagination } from '@/components/layout/pagination';
import { VagaCard } from './VagaCard';
import { VagasStats } from './VagasStats';
import { VagasFilters } from './VagasFilters';

const NAV_ITEMS = [
  { label: 'Início',     path: '/dashboard' },
  { label: 'Vagas',      path: '/vagas'     },
  { label: 'Candidatos', path: '/candidatos'},
  { label: 'Dashboard',  path: '/dashboard' },
  { label: 'Relatórios', path: '/relatorios'},
];

export function GerenciarVagas() {
  const navigate = useNavigate();

  const [vagas, setVagas]           = useState<Vaga[]>([]);
  const [loading, setLoading]       = useState(true);
  const [totalDocs, setTotalDocs]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);

  const [q, setQ]           = useState('');
  const [area, setArea]     = useState('');
  const [status, setStatus] = useState('');
  const [ordem, setOrdem]   = useState('recentes');

  const fetchVagas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVagasPaginadas(page, 6, { area, status, q });
      setVagas(res.docs ?? []);
      setTotalDocs(res.totalDocs);
      setTotalPages(res.totalPages);
    } catch {
      setVagas([]);
    } finally {
      setLoading(false);
    }
  }, [page, area, status, q]);

  useEffect(() => { fetchVagas(); }, [fetchVagas]);
  useEffect(() => { setPage(1); }, [area, status, q]);

  const counts = {
    total:      totalDocs,
    ativas:     vagas.filter(v => ['ativa', 'aberta'].includes(v.status?.toLowerCase() ?? '')).length,
    pausadas:   vagas.filter(v => v.status?.toLowerCase() === 'pausada').length,
    encerradas: vagas.filter(v => FINISHED_STATUSES.includes(v.status?.toLowerCase() ?? '')).length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="bg-[#1a2b45] text-white">
          <div className="container mx-auto px-8 max-w-[1400px] py-12 flex items-center justify-between">
            <div>
              <h1 className="text-[36px] font-black tracking-tight mb-2">Gerenciamento de Vagas</h1>
              <p className="text-[14px] text-white/70 max-w-[480px] leading-relaxed">
                Visualize, edite e acompanhe o progresso de todos os processos seletivos ativos na Azure Talent Ledger.
              </p>
            </div>
            <Button
              className="bg-white text-[#1a2b45] hover:bg-white/90 font-bold text-[13px] uppercase tracking-wider gap-2 px-6 py-3 h-auto"
              onClick={() => navigate('/vagas/nova')}
            >
              <Plus className="h-4 w-4" />
              Nova Vaga
            </Button>
          </div>
        </section>

        <VagasFilters
          q={q} area={area} status={status} ordem={ordem}
          onQChange={setQ} onAreaChange={setArea}
          onStatusChange={setStatus} onOrdemChange={setOrdem}
        />

        <VagasStats
          total={counts.total}
          ativas={counts.ativas}
          pausadas={counts.pausadas}
          encerradas={counts.encerradas}
        />

        <section className="container mx-auto px-8 max-w-[1400px] pb-16">
          {loading ? (
            <CardsSkeleton />
          ) : vagas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vagas.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant rounded-md p-5 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="border-t border-outline-variant pt-3 flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
      <p className="text-[14px]">Nenhuma vaga encontrada.</p>
    </div>
  );
}
