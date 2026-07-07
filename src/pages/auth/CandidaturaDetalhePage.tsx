import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getCandidatura, type Candidatura } from '@/features/candidato/api';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';

export default function CandidaturaDetalhePage() {
  const { vagaId } = useParams<{ vagaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [candidatura, setCandidatura] = useState<Candidatura | null>(null);
  const [vaga, setVaga]     = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!vagaId || !user) return;
    let cancelado = false;

    (async () => {
      try {
        const [c, v] = await Promise.all([
          getCandidatura(user.id, vagaId),
          getVaga(vagaId).catch(() => null),
        ]);
        if (!cancelado) {
          setCandidatura(c);
          setVaga(v);
        }
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : 'Candidatura não encontrada.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => { cancelado = true; };
  }, [vagaId, user]);

  const status = candidatura ? STATUS_CANDIDATURA_CONFIG[candidatura.status] : null;
  const date = candidatura?.criadoEm
    ? new Date(candidatura.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-on-surface-variant gap-1.5 rounded-xl"
          onClick={() => navigate('/minhas-candidaturas')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para candidaturas
        </Button>

        {loading ? (
          <div className="space-y-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : error || !candidatura ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Briefcase className="h-10 w-10 text-on-surface-variant opacity-30 mx-auto mb-3" />
            <p className="text-[15px] font-medium text-primary">{error ?? 'Candidatura não encontrada.'}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                {vaga?.area && (
                  <Badge className="rounded-full text-xs font-medium px-3 py-0.5 border-none bg-gray-100 text-gray-600">
                    {vaga.area}
                  </Badge>
                )}
                {status && (
                  <span className={cn('flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-0.5', status.badge)}>
                    <span className={cn('h-2 w-2 rounded-full flex-shrink-0', status.dot)} />
                    {status.label}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-primary mb-2">
                {vaga?.titulo ?? 'Vaga indisponível'}
              </h1>

              {date && (
                <span className="flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  Candidatura enviada em {date}
                </span>
              )}

              {vaga && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="rounded-xl gap-1.5 text-[13px]"
                    onClick={() => navigate(`/vagas/${vaga.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver detalhes da vaga
                  </Button>
                </div>
              )}
            </div>

            {vaga?.descricao && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h2 className="text-[16px] font-semibold text-primary mb-3">Sobre a vaga</h2>
                <p className="text-[14px] text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {vaga.descricao}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
