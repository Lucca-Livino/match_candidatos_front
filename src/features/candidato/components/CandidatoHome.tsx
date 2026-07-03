import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, ClipboardList, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pagination } from '@/components/layout/pagination';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getVagasPaginadas } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';
import { AREAS } from '@/features/vagas/constants';
import { VagaCandidatoCard } from './VagaCandidatoCard';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';

const LIMIT = 9;

export function CandidatoHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vagas, setVagas]           = useState<Vaga[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs]   = useState(0);

  const [q, setQ]       = useState('');
  const [area, setArea] = useState('');

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

  const firstName = user?.name?.split(' ')[0] ?? 'candidato';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      {/* Hero / Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-8 max-w-[1400px] py-10">
          <div className="mb-6">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/60 mb-2">
              Olá, {firstName}
            </p>
            <h1 className="text-[28px] font-bold leading-tight text-white! mb-1">
              Candidate-se nas vagas disponíveis
            </h1>
            <p className="text-[15px] text-white/70">
              {totalDocs > 0
                ? `${totalDocs} ${totalDocs === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'} para o seu perfil.`
                : 'Explore as oportunidades e dê o próximo passo na sua carreira.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por título ou palavra-chave..."
                className="pl-10 rounded-xl h-11 border-white/20 bg-white/15 text-white placeholder:text-white/50 focus:bg-white focus:text-primary focus:placeholder:text-on-surface-variant"
              />
            </div>
            <Select value={area || '_all'} onValueChange={v => setArea(v === '_all' ? '' : v)}>
              <SelectTrigger className="min-w-[160px] rounded-xl h-11 border-white/20 bg-white/15 text-white text-[13px]">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas as áreas</SelectItem>
                {AREAS.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-8 max-w-[1400px] py-10">
        {/* Vagas grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" />
              Vagas disponíveis
            </h2>
            {!loading && vagas.length > 0 && (
              <span className="text-[13px] text-on-surface-variant">
                {totalDocs} {totalDocs === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </div>

          {loading ? (
            <VagasSkeletonGrid />
          ) : vagas.length === 0 ? (
            <EmptyVagas onClear={() => { setQ(''); setArea(''); }} />
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
        </div>

        {/* Candidaturas CTA */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <ClipboardList className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-primary mb-1">Suas candidaturas</h3>
              <p className="text-[13px] text-on-surface-variant">
                Acompanhe o andamento de todos os processos seletivos em que você participou.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-outline-variant text-[13px] font-medium gap-2 whitespace-nowrap"
            onClick={() => navigate('/minhas-candidaturas')}
          >
            Ver candidaturas
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function VagasSkeletonGrid() {
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
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl mt-2" />
        </div>
      ))}
    </div>
  );
}

function EmptyVagas({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center text-center">
      <div className="p-4 bg-surface-container rounded-2xl mb-4">
        <Briefcase className="h-8 w-8 text-on-surface-variant opacity-50" />
      </div>
      <p className="text-[15px] font-medium text-primary mb-1">Nenhuma vaga encontrada</p>
      <p className="text-[13px] text-on-surface-variant mb-5">
        Tente ajustar os filtros ou buscar por outro termo.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl text-[13px]"
        onClick={onClear}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
