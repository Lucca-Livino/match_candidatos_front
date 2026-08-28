import { Mail, GraduationCap, Briefcase, Wrench, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GRAU_LABEL, NIVEL_LABEL, NIVEL_BADGE } from '@/features/perfil/constants';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import { useCandidatoDetalhe } from '../hooks/useCandidatoDetalhe';
import type { CandidaturaVaga } from '../types';

interface CandidatoDetalheDialogProps {
  candidatura: CandidaturaVaga | null;
  onClose: () => void;
}

export function CandidatoDetalheDialog({ candidatura, onClose }: CandidatoDetalheDialogProps) {
  const usuarioId = candidatura?.usuarioId ?? null;
  const { formacoes, experiencias, habilidades, certificacoes, loading, error } =
    useCandidatoDetalhe(usuarioId);

  const nome = candidatura?.candidato?.nome ?? 'Candidato';
  const email = candidatura?.candidato?.email;
  const statusCfg = candidatura ? STATUS_CANDIDATURA_CONFIG[candidatura.status] : null;

  return (
    <Dialog open={!!candidatura} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[16px] font-bold flex-shrink-0">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{nome}</DialogTitle>
              {email && (
                <p className="text-[13px] text-on-surface-variant flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </p>
              )}
            </div>
            {statusCfg && (
              <Badge className={cn('border-none text-[11px] font-medium', statusCfg.badge)}>
                {statusCfg.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Habilidades */}
            <Secao icon={Wrench} titulo="Habilidades" vazio={habilidades.length === 0}>
              <div className="flex flex-wrap gap-2">
                {habilidades.map(h => (
                  <Badge key={h.id} className={cn('border-none text-[12px] font-medium', NIVEL_BADGE[h.nivel])}>
                    {h.habilidade} · {NIVEL_LABEL[h.nivel]}
                  </Badge>
                ))}
              </div>
            </Secao>

            {/* Experiência */}
            <Secao icon={Briefcase} titulo="Experiência" vazio={experiencias.length === 0}>
              <div className="space-y-3">
                {experiencias.map(e => (
                  <div key={e.id} className="bg-[#f8f9fc] rounded-xl p-4">
                    <p className="text-[14px] font-semibold text-primary">{e.cargo}</p>
                    <p className="text-[13px] text-on-surface-variant">{e.empresa}</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                      {formatarPeriodo(e.dataInicio, e.dataFim)}
                    </p>
                    {e.descricaoAtivida_ && (
                      <p className="text-[13px] text-on-surface-variant mt-2 whitespace-pre-line">
                        {e.descricaoAtivida_}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Secao>

            {/* Formação */}
            <Secao icon={GraduationCap} titulo="Formação" vazio={formacoes.length === 0}>
              <div className="space-y-3">
                {formacoes.map(f => (
                  <div key={f.id} className="bg-[#f8f9fc] rounded-xl p-4">
                    <p className="text-[14px] font-semibold text-primary">{f.curso}</p>
                    <p className="text-[13px] text-on-surface-variant">
                      {f.instituicao} · {GRAU_LABEL[f.grau]}
                    </p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                      {f.anoInicio}{f.anoConclusao ? ` – ${f.anoConclusao}` : ' – Em andamento'} · {f.situacao}
                    </p>
                  </div>
                ))}
              </div>
            </Secao>

            {/* Certificações */}
            <Secao icon={Award} titulo="Certificações" vazio={certificacoes.length === 0}>
              <div className="space-y-3">
                {certificacoes.map(c => (
                  <div key={c.id} className="bg-[#f8f9fc] rounded-xl p-4">
                    <p className="text-[14px] font-semibold text-primary">{c.nome}</p>
                    <p className="text-[13px] text-on-surface-variant">{c.emissor}</p>
                    {(c.dataEmissao || c.codigo) && (
                      <p className="text-[12px] text-on-surface-variant mt-0.5">
                        {c.dataEmissao ? formatarData(c.dataEmissao) : ''}
                        {c.codigo ? ` · ${c.codigo}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Secao>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SecaoProps {
  icon: typeof Briefcase;
  titulo: string;
  vazio: boolean;
  children: React.ReactNode;
}

function Secao({ icon: Icon, titulo, vazio, children }: SecaoProps) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-primary flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-secondary" />
        {titulo}
      </h3>
      {vazio ? (
        <p className="text-[13px] text-on-surface-variant italic">Nada informado.</p>
      ) : (
        children
      )}
    </div>
  );
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function formatarPeriodo(inicio: string, fim: string | null): string {
  const ini = formatarData(inicio);
  const f = fim ? formatarData(fim) : 'Atual';
  return `${ini} – ${f}`;
}
