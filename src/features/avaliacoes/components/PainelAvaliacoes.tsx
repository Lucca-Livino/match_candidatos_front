import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvaliacoes } from '../api';
import type { AvaliacaoAuditoria } from '../types';

function formatarData(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * Distância do score até o limiar. É o número que importa para calibrar:
 * uma fila de candidaturas reprovadas por 0,02 diz que o limiar está alto.
 */
function margem(score?: number | null, limite?: number | null) {
  if (score == null || limite == null) return null;
  return score - limite;
}

export function PainelAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAuditoria[]>([]);
  const [somentePendentes, setSomentePendentes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // `ativo` descarta a resposta de uma requisicao que ficou obsoleta quando
    // o filtro muda antes de ela voltar.
    let ativo = true;

    async function carregar() {
      setLoading(true);
      try {
        const lista = await getAvaliacoes({ apenasPendentes: somentePendentes });
        if (!ativo) return;
        setAvaliacoes(lista);
        setErro(null);
      } catch {
        if (ativo) setErro('Falha ao carregar as avaliações.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [somentePendentes]);

  const resumo = useMemo(() => {
    const avaliadas = avaliacoes.filter((a) => a.avaliadoEm);
    const compativeis = avaliadas.filter((a) => (a.compativel ?? 0) >= 1).length;
    const scores = avaliadas.map((a) => a.scoreIA).filter((s): s is number => s != null);
    return {
      total: avaliacoes.length,
      pendentes: avaliacoes.filter((a) => !a.avaliadoEm).length,
      compativeis,
      incompativeis: avaliadas.length - compativeis,
      scoreMedio: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    };
  }, [avaliacoes]);

  return (
    <div className="space-y-6">
      {erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-[13px]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {erro}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Cartao rotulo="Total" valor={resumo.total} />
        <Cartao rotulo="Compatíveis" valor={resumo.compativeis} className="text-emerald-700" />
        <Cartao rotulo="Não compatíveis" valor={resumo.incompativeis} className="text-amber-700" />
        <Cartao
          rotulo="Pendentes"
          valor={resumo.pendentes}
          className={resumo.pendentes > 0 ? 'text-red-700' : undefined}
        />
        <Cartao
          rotulo="Score médio"
          valor={resumo.scoreMedio == null ? '—' : resumo.scoreMedio.toFixed(2)}
        />
      </div>

      {resumo.pendentes > 0 && !somentePendentes && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {resumo.pendentes} candidatura{resumo.pendentes === 1 ? '' : 's'} sem avaliação. Pode ser
          a IA fora do ar ou a triagem desligada — o recrutador não vê essa diferença.
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={somentePendentes ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSomentePendentes((v) => !v)}
        >
          {somentePendentes ? 'Mostrando só pendentes' : 'Filtrar pendentes'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      ) : avaliacoes.length === 0 ? (
        <p className="text-[13px] text-on-surface-variant py-8 text-center">
          Nenhuma avaliação encontrada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-outline-variant bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3">Candidato</th>
                <th className="px-4 py-3">Vaga</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Limiar</th>
                <th className="px-4 py-3">Margem</th>
                <th className="px-4 py-3">Resultado</th>
                <th className="px-4 py-3">Fila</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Avaliado</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map((a) => (
                <LinhaAvaliacao key={a.id} avaliacao={a} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Cartao({
  rotulo,
  valor,
  className,
}: {
  rotulo: string;
  valor: number | string;
  className?: string;
}) {
  return (
    <div className="rounded-md border border-outline-variant bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {rotulo}
      </p>
      <p className={`mt-1 text-[22px] font-black ${className ?? 'text-primary'}`}>{valor}</p>
    </div>
  );
}

function LinhaAvaliacao({ avaliacao: a }: { avaliacao: AvaliacaoAuditoria }) {
  const m = margem(a.scoreIA, a.limiteAplicado);
  const pendente = !a.avaliadoEm;

  return (
    <tr className="border-b border-outline-variant last:border-0 align-top">
      <td className="px-4 py-3">
        <p className="font-semibold text-primary">{a.candidato?.nome ?? '—'}</p>
        <p className="text-[12px] text-on-surface-variant">{a.candidato?.email ?? ''}</p>
      </td>
      <td className="px-4 py-3 text-on-surface-variant">{a.vaga?.titulo ?? '—'}</td>
      <td className="px-4 py-3 font-mono">{a.scoreIA?.toFixed(2) ?? '—'}</td>
      <td className="px-4 py-3 font-mono text-on-surface-variant">
        {a.limiteAplicado?.toFixed(2) ?? '—'}
      </td>
      <td className="px-4 py-3 font-mono">
        {m == null ? (
          '—'
        ) : (
          <span className={m >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
            {m >= 0 ? '+' : ''}
            {m.toFixed(2)}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {pendente ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800">
            Pendente
          </span>
        ) : (a.compativel ?? 0) >= 1 ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
            Compatível
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
            Não compatível
          </span>
        )}
        {a.motivoIncompat_ && (
          <p className="mt-1 max-w-[240px] text-[12px] text-on-surface-variant">
            {a.motivoIncompat_}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-on-surface-variant">{a.status}</span>
        {a.movidoPor === 'ia' && (
          <p className="text-[11px] text-on-surface-variant">movido pela IA</p>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-[12px] text-on-surface-variant">
        {a.versaoModelo ?? '—'}
      </td>
      <td className="px-4 py-3 text-[12px] text-on-surface-variant">
        {formatarData(a.avaliadoEm)}
      </td>
    </tr>
  );
}
