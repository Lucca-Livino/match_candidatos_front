import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Loader2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/nav';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import type { StatusCandidatura } from '@/features/candidato/api';
import { useCandidaturasVaga } from '../hooks/useCandidaturasVaga';
import { CandidatoDetalheDialog } from './CandidatoDetalheDialog';
import type { CandidaturaVaga } from '../types';

const COLUNAS: StatusCandidatura[] = ['inscrito', 'em_analise', 'aprovado', 'reprovado'];

// Resultado binario da triagem. Nao existe porcentagem nem posicao: o score
// bruto fica na API como registro de auditoria e a lista chega na ordem de
// inscricao. Mostrar nota aqui reintroduziria o vies de ancoragem que a
// triagem sem ranking existe para evitar.
function BadgeTriagem({
  compativel,
  avaliadoEm,
}: {
  compativel?: number;
  avaliadoEm?: string | null;
}) {
  if (!avaliadoEm) {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
        Aguardando análise
      </span>
    );
  }
  return (compativel ?? 0) >= 1 ? (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
      Compatível
    </span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
      Não compatível
    </span>
  );
}

// Fluxo espelha a regra do backend (CandidaturaService.validarTransicaoStatus).
const TRANSICOES: Record<StatusCandidatura, StatusCandidatura[]> = {
  inscrito:   ['em_analise'],
  em_analise: ['aprovado', 'reprovado'],
  aprovado:   [],
  reprovado:  [],
};

const ACAO_CONFIG: Record<
  StatusCandidatura,
  { label: string; icon: typeof ArrowRight; className: string }
> = {
  em_analise: { label: 'Mover p/ análise', icon: ArrowRight,   className: 'bg-yellow-500 hover:bg-yellow-500/90 text-white' },
  aprovado:   { label: 'Aprovar',          icon: CheckCircle2, className: 'bg-emerald-600 hover:bg-emerald-600/90 text-white' },
  reprovado:  { label: 'Reprovar',         icon: XCircle,      className: 'bg-red-600 hover:bg-red-600/90 text-white' },
  inscrito:   { label: 'Inscrito',         icon: ArrowRight,   className: '' },
};

export function GerenciarCandidatosVaga() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vaga, candidaturas, loading, error, movendoId, moverStatus } = useCandidaturasVaga(id);
  const [selecionado, setSelecionado] = useState<CandidaturaVaga | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="bg-[#1a2b45] text-white">
          <div className="container mx-auto px-8 max-w-[1400px] py-10">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
              onClick={() => navigate('/vagas')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para vagas
            </Button>
            <p className="text-[12px] font-bold uppercase tracking-wider text-white/50 mb-1">
              Gerenciar candidatos
            </p>
            <h1 className="text-[32px] font-black tracking-tight !text-white">
              {loading ? 'Carregando…' : vaga?.titulo ?? 'Vaga'}
            </h1>
            <p className="text-[13px] text-white/70 mt-2 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {candidaturas.length} candidato{candidaturas.length === 1 ? '' : 's'}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-8 max-w-[1400px] py-10">
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <KanbanSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {COLUNAS.map(status => {
                const cfg = STATUS_CANDIDATURA_CONFIG[status];
                const doColuna = candidaturas.filter(c => c.status === status);
                return (
                  <div key={status} className="flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-primary">
                        <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                      <span className="text-[12px] font-medium text-on-surface-variant bg-muted/60 rounded-full px-2 py-0.5">
                        {doColuna.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 rounded-md bg-muted/30 p-3 min-h-[120px]">
                      {doColuna.length === 0 ? (
                        <p className="text-[12px] text-on-surface-variant text-center py-6">Nenhum candidato</p>
                      ) : (
                        doColuna.map(c => (
                          <CandidatoCard
                            key={c.id}
                            candidatura={c}
                            movendo={movendoId === c.id}
                            onMover={moverStatus}
                            onVer={setSelecionado}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CandidatoDetalheDialog candidatura={selecionado} onClose={() => setSelecionado(null)} />
    </div>
  );
}

interface CandidatoCardProps {
  candidatura: CandidaturaVaga;
  movendo: boolean;
  onMover: (candidatura: CandidaturaVaga, novoStatus: StatusCandidatura) => void;
  onVer: (candidatura: CandidaturaVaga) => void;
}

function CandidatoCard({ candidatura, movendo, onMover, onVer }: CandidatoCardProps) {
  const nome = candidatura.candidato?.nome ?? 'Candidato removido';
  const email = candidatura.candidato?.email;
  const acoes = TRANSICOES[candidatura.status];

  return (
    <div className="bg-white border border-outline-variant rounded-md p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onVer(candidatura)}
        className="flex items-start gap-3 w-full text-left rounded-md -m-1 p-1 hover:bg-muted/40 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[13px] font-bold flex-shrink-0">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-primary leading-tight truncate">{nome}</p>
          {email && (
            <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          )}
          <div className="mt-1.5">
            <BadgeTriagem
              compativel={candidatura.compativel}
              avaliadoEm={candidatura.avaliadoEm}
            />
          </div>
        </div>
      </button>

      {acoes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant">
          {acoes.map(novoStatus => {
            const acao = ACAO_CONFIG[novoStatus];
            const Icon = acao.icon;
            return (
              <Button
                key={novoStatus}
                size="sm"
                disabled={movendo}
                className={cn('h-7 text-[11px] font-bold gap-1 px-2.5', acao.className)}
                onClick={() => onMover(candidatura, novoStatus)}
              >
                {movendo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                {acao.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3 rounded-md bg-muted/30 p-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
