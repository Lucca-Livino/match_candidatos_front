import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';
import { AREA_BADGE } from '@/features/vagas/constants';
import { CANDIDATO_NAV_ITEMS } from '@/lib/nav';

const TIPO_LABEL: Record<string, string> = {
  skill_tecnica: 'Habilidade técnica',
  formacao:      'Formação',
  experiencia:   'Experiência',
  certificacao:  'Certificação',
};

export default function VagaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vaga, setVaga]     = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getVaga(id)
      .then(setVaga)
      .catch(() => setError('Vaga não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const areaKey = vaga?.area?.toUpperCase() ?? '';
  const areaBadge = AREA_BADGE[areaKey] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] font-sans">
      <Header navItems={CANDIDATO_NAV_ITEMS} />

      <main className="flex-grow container mx-auto px-8 max-w-[900px] py-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-on-surface-variant gap-1.5 rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {loading ? (
          <VagaDetalheSkeketon />
        ) : error || !vaga ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Briefcase className="h-10 w-10 text-on-surface-variant opacity-30 mx-auto mb-3" />
            <p className="text-[15px] font-medium text-primary">{error ?? 'Vaga não encontrada.'}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <Badge className={cn('rounded-full text-xs font-medium px-3 py-0.5 border-none', areaBadge)}>
                  {vaga.area}
                </Badge>
                <span className="text-[12px] text-on-surface-variant whitespace-nowrap">
                  {vaga.criadoEm
                    ? new Date(vaga.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : ''}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-primary mb-2">{vaga.titulo}</h1>

              {vaga.descricao && (
                <p className="text-[14px] text-on-surface-variant leading-relaxed">{vaga.descricao}</p>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100">
                <Button
                  className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl px-8 h-11 text-[14px] font-medium hover:opacity-90 transition-opacity"
                >
                  Candidatar-se
                </Button>
              </div>
            </div>

            {/* Requisitos */}
            {vaga.requisitos_gerais && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h2 className="text-[16px] font-semibold text-primary mb-3">Requisitos gerais</h2>
                <p className="text-[14px] text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {vaga.requisitos_gerais}
                </p>
              </div>
            )}

            {/* Critérios */}
            {(vaga.criterio_vaga?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h2 className="text-[16px] font-semibold text-primary mb-4">O que buscamos</h2>
                <div className="space-y-3">
                  {vaga.criterio_vaga!.map((c, i) => (
                    <div key={c._id ?? i} className="flex items-start gap-3 p-4 bg-[#f8f9fc] rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-medium text-primary">{c.nome}</span>
                          <span className="text-[11px] bg-white border border-gray-200 text-on-surface-variant rounded-full px-2 py-0.5">
                            {TIPO_LABEL[c.tipo_criterio] ?? c.tipo_criterio}
                          </span>
                          {c.obrigatorio && (
                            <span className="text-[11px] bg-red-50 text-red-600 rounded-full px-2 py-0.5">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        {c.descricao && (
                          <p className="text-[12px] text-on-surface-variant mt-1">{c.descricao}</p>
                        )}
                      </div>
                      <span className="text-[12px] text-on-surface-variant whitespace-nowrap">
                        {c.peso_percentual}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function VagaDetalheSkeketon() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-11 w-40 rounded-xl mt-4" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-7 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
