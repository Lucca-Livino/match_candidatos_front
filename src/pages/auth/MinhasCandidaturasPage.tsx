import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { listarCandidaturas, type Candidatura } from '@/features/candidato/api';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';

interface CandidaturaComVaga extends Candidatura {
  vaga: Vaga | null;
}

export default function MinhasCandidaturasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems]     = useState<CandidaturaComVaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    (async () => {
      try {
        const candidaturas = await listarCandidaturas(user.id);
        const comVagas = await Promise.all(
          candidaturas.map(async (c) => ({
            ...c,
            vaga: await getVaga(c.vagaId).catch(() => null),
          })),
        );
        if (!cancelado) setItems(comVagas);
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : 'Falha ao carregar candidaturas.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => { cancelado = true; };
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <h1 className="text-2xl font-bold text-primary mb-1">Minhas Candidaturas</h1>
        <p className="text-[14px] text-on-surface-variant mb-8">
          Acompanhe o andamento dos seus processos seletivos.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-[15px] font-medium text-red-600">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <ClipboardList className="h-10 w-10 text-on-surface-variant opacity-30 mx-auto mb-3" />
            <p className="text-[15px] font-medium text-primary mb-1">Nenhuma candidatura ainda</p>
            <p className="text-[13px] text-on-surface-variant">
              Explore as vagas disponíveis e candidate-se para acompanhar aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((c) => {
              const status = STATUS_CANDIDATURA_CONFIG[c.status];
              const date = c.criadoEm
                ? new Date(c.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                : null;
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/minhas-candidaturas/${c.vagaId}`)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.vaga?.area && (
                        <Badge className="rounded-full text-xs font-medium px-3 py-0.5 border-none bg-gray-100 text-gray-600">
                          {c.vaga.area}
                        </Badge>
                      )}
                    </div>
                    <span className={cn('flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-0.5', status.badge)}>
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', status.dot)} />
                      {status.label}
                    </span>
                  </div>

                  <h2 className="text-[17px] font-semibold text-primary leading-snug">
                    {c.vaga?.titulo ?? 'Vaga indisponível'}
                  </h2>

                  {date && (
                    <span className="flex items-center gap-1 text-[12px] text-on-surface-variant mt-3">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      Candidatura em {date}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
