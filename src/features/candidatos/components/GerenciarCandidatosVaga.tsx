import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Loader2, ArrowRight, CheckCircle2, XCircle, RotateCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/nav';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import type { StatusCandidatura } from '@/features/candidato/api';
import { useCandidaturasVaga } from '../hooks/useCandidaturasVaga';
import { CandidatoDetalheDialog } from './CandidatoDetalheDialog';
import type { CandidaturaVaga } from '../types';
import { formatarDataCompleta } from '../format';

const COLUNAS: StatusCandidatura[] = ['inscrito', 'em_analise', 'aprovado', 'reprovado'];

// Fluxo espelha a regra do backend (CandidaturaService.validarTransicaoStatus).
// Aprovado e reprovado podem ser reabertos para análise.
const TRANSICOES: Record<StatusCandidatura, StatusCandidatura[]> = {
  inscrito:   ['em_analise'],
  em_analise: ['aprovado', 'reprovado'],
  aprovado:   ['em_analise'],
  reprovado:  ['em_analise'],
};

const DECISOES: StatusCandidatura[] = ['aprovado', 'reprovado'];

const REABRIR = {
  label: 'Reabrir análise',
  icon: RotateCcw,
  className: 'bg-white border border-outline-variant text-on-surface hover:bg-muted/50',
};

const ACAO_CONFIG: Record<
  StatusCandidatura,
  { label: string; icon: typeof ArrowRight; className: string }
> = {
  em_analise: { label: 'Mover para análise', icon: ArrowRight,   className: 'bg-yellow-500 hover:bg-yellow-500/90 text-on-surface' },
  aprovado:   { label: 'Aprovar',            icon: CheckCircle2, className: 'bg-emerald-700 hover:bg-emerald-700/90 text-white' },
  reprovado:  { label: 'Reprovar',           icon: XCircle,      className: 'bg-error hover:bg-error/90 text-white' },
  inscrito:   { label: 'Inscrito',         icon: ArrowRight,   className: '' },
};

export function GerenciarCandidatosVaga() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vaga, candidaturas, loading, error, movendoId, moverStatus, recarregar } = useCandidaturasVaga(id);
  const [selecionado, setSelecionado] = useState<CandidaturaVaga | null>(null);
  // Aprovar e reprovar pedem confirmação: o candidato passa a ver a decisão.
  const [confirmando, setConfirmando] = useState<{ candidatura: CandidaturaVaga; status: StatusCandidatura } | null>(null);

  function pedirMover(candidatura: CandidaturaVaga, novoStatus: StatusCandidatura) {
    if (DECISOES.includes(novoStatus)) setConfirmando({ candidatura, status: novoStatus });
    else moverStatus(candidatura, novoStatus);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section>
          <div className="container mx-auto px-8 max-w-[1400px] pt-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-on-surface-variant hover:text-primary gap-1.5"
              onClick={() => navigate('/vagas')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para vagas
            </Button>
            <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Gerenciar candidatos
            </p>
            <h1 className="text-[28px] font-black tracking-tight leading-tight text-balance text-primary">
              {loading ? 'Carregando…' : vaga?.titulo ?? 'Vaga'}
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-2 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {candidaturas.length} candidato{candidaturas.length === 1 ? '' : 's'}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-8 max-w-[1400px] py-10">
          {error && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-error-container px-4 py-3 text-[13px] text-on-error-container">
              {error}
              <Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={recarregar}>
                <RotateCw className="h-3.5 w-3.5" />
                Recarregar candidatos
              </Button>
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
                  <section
                    key={status}
                    aria-labelledby={`coluna-${status}`}
                    className={cn('flex flex-col rounded-md border-t-4 p-3', cfg.coluna, cfg.topo)}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h2 id={`coluna-${status}`} className="flex items-center gap-2 text-[13px] font-bold text-primary tracking-normal">
                        <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </h2>
                      <span className={cn('text-[12px] font-bold rounded-full px-2 py-0.5 tabular-nums', cfg.badge)}>
                        {doColuna.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 min-h-[120px]">
                      {doColuna.length === 0 ? (
                        <p className="text-[12px] text-on-surface-variant text-center py-6">Nenhum candidato</p>
                      ) : (
                        doColuna.map(c => (
                          <CandidatoCard
                            key={c.id}
                            candidatura={c}
                            movendo={movendoId === c.id}
                            onMover={pedirMover}
                            onVer={setSelecionado}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CandidatoDetalheDialog candidatura={selecionado} onClose={() => setSelecionado(null)} />

      <ConfirmarStatusDialog
        pedido={confirmando}
        onCancelar={() => setConfirmando(null)}
        onConfirmar={() => {
          if (confirmando) moverStatus(confirmando.candidatura, confirmando.status);
          setConfirmando(null);
        }}
      />
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
  const decidida = DECISOES.includes(candidatura.status);
  const reabertaEm = candidatura.status === 'em_analise' ? formatarDataCompleta(candidatura.reabertoEm) : '';

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
          {reabertaEm && (
            <p className="text-[11px] text-on-surface-variant mt-1">Análise reaberta em {reabertaEm}</p>
          )}
        </div>
      </button>

      {acoes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant">
          {acoes.map(novoStatus => {
            const acao = decidida ? REABRIR : ACAO_CONFIG[novoStatus];
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

interface ConfirmarStatusDialogProps {
  pedido: { candidatura: CandidaturaVaga; status: StatusCandidatura } | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

function ConfirmarStatusDialog({ pedido, onCancelar, onConfirmar }: ConfirmarStatusDialogProps) {
  const nome = pedido?.candidatura.candidato?.nome ?? 'este candidato';
  const reprovar = pedido?.status === 'reprovado';

  return (
    <Dialog open={!!pedido} onOpenChange={o => !o && onCancelar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{reprovar ? `Reprovar ${nome}?` : `Aprovar ${nome}?`}</DialogTitle>
          <DialogDescription>
            O candidato passará a ver a candidatura como {reprovar ? 'reprovada' : 'aprovada'}. Se
            precisar corrigir, use “Reabrir análise” no card.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
          <Button
            className={ACAO_CONFIG[reprovar ? 'reprovado' : 'aprovado'].className}
            onClick={onConfirmar}
          >
            {reprovar ? 'Reprovar candidato' : 'Aprovar candidato'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-md border-t-4 border-t-outline-variant bg-muted/30 p-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
