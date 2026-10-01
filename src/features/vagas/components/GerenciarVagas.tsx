import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, AlertCircle, RotateCw } from 'lucide-react';
import { getVagasPaginadas } from '../api';
import type { Vaga } from '../types';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pagination } from '@/components/layout/pagination';
import { VagaCard } from './VagaCard';
import { VagasStats } from './VagasStats';
import { VagasFilters } from './VagasFilters';
import { NAV_ITEMS } from '@/lib/nav';

export function GerenciarVagas() {
  const navigate = useNavigate();

  const [vagas, setVagas]           = useState<Vaga[]>([]);
  const [loading, setLoading]       = useState(true);
  const [totalDocs, setTotalDocs]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [erro, setErro]             = useState(false);
  const [counts, setCounts]         = useState({ ativas: 0, pausadas: 0, encerradas: 0 });

  const [q, setQ]           = useState('');
  const [area, setArea]     = useState('');
  const [status, setStatus] = useState('');
  const [ordem, setOrdem]   = useState('recentes');

  const fetchVagas = useCallback(async () => {
    setLoading(true);
    setErro(false);
    try {
      // Contagens por status com os mesmos filtros de área e busca: contar só
      // os itens da página atual fazia a soma não bater com o total.
      const contar = (s: string) =>
        status && status !== s
          ? Promise.resolve(0)
          : getVagasPaginadas(1, 1, { area, status: s, q }).then(r => r.totalDocs);
      const [res, ativas, pausadas, encerradas] = await Promise.all([
        getVagasPaginadas(page, 6, { area, status, q }),
        contar('ativa'),
        contar('pausada'),
        contar('arquivada'),
      ]);
      setVagas(res.docs ?? []);
      setTotalDocs(res.totalDocs);
      setTotalPages(res.totalPages);
      setCounts({ ativas, pausadas, encerradas });
    } catch {
      setVagas([]);
      setErro(true);
    } finally {
      setLoading(false);
    }
  }, [page, area, status, q]);

  useEffect(() => { fetchVagas(); }, [fetchVagas]);
  useEffect(() => { setPage(1); }, [area, status, q]);

  const temFiltro = Boolean(q || area || status);

  function limparFiltros() {
    setQ('');
    setArea('');
    setStatus('');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section>
          <div className="container mx-auto px-8 max-w-[1400px] pt-10 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-[28px] font-black tracking-tight leading-tight text-balance text-primary mb-1">Gerenciamento de Vagas</h1>
              <p className="text-[14px] text-on-surface-variant max-w-[480px] leading-relaxed">
                Visualize, edite e acompanhe o progresso de todos os processos seletivos ativos na sua empresa.
              </p>
            </div>
            <Button
              className="bg-primary text-white hover:bg-primary/90 font-bold text-[13px] uppercase tracking-wider gap-2 px-6 py-3 h-auto"
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
          total={totalDocs}
          ativas={counts.ativas}
          pausadas={counts.pausadas}
          encerradas={counts.encerradas}
        />

        <section className="container mx-auto px-8 max-w-[1400px] pb-16">
          {loading ? (
            <CardsSkeleton />
          ) : erro ? (
            <ErrorState onRetry={fetchVagas} />
          ) : vagas.length === 0 ? (
            <EmptyState
              temFiltro={temFiltro}
              onLimpar={limparFiltros}
              onNova={() => navigate('/vagas/nova')}
            />
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertCircle className="h-8 w-8 text-error" />
      <div>
        <p className="text-[15px] font-semibold text-on-surface">Não foi possível carregar as vagas.</p>
        <p className="text-[14px] text-on-surface-variant">Verifique a conexão com a API e tente novamente.</p>
      </div>
      <Button variant="outline" className="gap-2 bg-white" onClick={onRetry}>
        <RotateCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  temFiltro: boolean;
  onLimpar: () => void;
  onNova: () => void;
}

function EmptyState({ temFiltro, onLimpar, onNova }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div>
        <p className="text-[15px] font-semibold text-on-surface">
          {temFiltro ? 'Nenhuma vaga corresponde aos filtros.' : 'Nenhuma vaga cadastrada ainda.'}
        </p>
        <p className="text-[14px] text-on-surface-variant">
          {temFiltro
            ? 'Ajuste a busca ou limpe os filtros para ver todas as vagas.'
            : 'Crie a primeira vaga para começar a receber candidaturas.'}
        </p>
      </div>
      {temFiltro ? (
        <Button variant="outline" className="bg-white" onClick={onLimpar}>Limpar filtros</Button>
      ) : (
        <Button onClick={onNova} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova vaga
        </Button>
      )}
    </div>
  );
}
