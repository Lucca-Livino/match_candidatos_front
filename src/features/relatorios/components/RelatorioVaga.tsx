import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import { getRelatorioVaga } from '../api';
import { useRelatorio } from '../hooks/useRelatorio';
import { descricaoPeriodo, detalheTaxa, formatarData, formatarPercentual } from '../format';
import { itensFunil, rotuloStatusVaga } from '../cores';
import type { Periodo, RelatorioVaga as Dados } from '../types';
import { LayoutRelatorio } from './LayoutRelatorio';
import { RelatorioCarregando, RelatorioErro, AvisoSemDados } from './EstadosRelatorio';
import { ResumoNumeros } from './ResumoNumeros';
import { Bloco } from './Bloco';
import { GraficoBarras } from './GraficoBarras';
import { BlocoSerie } from './BlocoSerie';

const VOLTAR = { rotulo: 'Voltar para vagas', para: '/vagas' };

export function RelatorioVaga() {
  const { id = '' } = useParams<{ id: string }>();
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const buscar = useCallback(() => getRelatorioVaga(id, periodo), [id, periodo]);
  const { dados, loading, erro, recarregar } = useRelatorio(buscar);

  if (erro?.status === 404) {
    return (
      <LayoutRelatorio
        titulo="Vaga não encontrada"
        descricao="A vaga pode ter sido removida."
        voltar={VOLTAR}
        periodo={periodo}
        onPeriodo={setPeriodo}
        controles={false}
      >
        <Button asChild>
          <Link to="/vagas">Ir para a lista de vagas</Link>
        </Button>
      </LayoutRelatorio>
    );
  }

  return (
    <LayoutRelatorio
      sobretitulo="Relatório da vaga"
      titulo={dados?.vaga.titulo ?? 'Carregando…'}
      descricao={dados ? descricaoVaga(dados.vaga) : 'Buscando os dados da vaga.'}
      voltar={VOLTAR}
      periodo={periodo}
      onPeriodo={setPeriodo}
      geradoEm={dados?.geradoEm}
    >
      {erro ? (
        <RelatorioErro mensagem={erro.mensagem} onTentar={recarregar} />
      ) : !dados ? (
        <RelatorioCarregando />
      ) : (
        <div aria-busy={loading} className={cn('space-y-6 transition-opacity', loading && 'opacity-60')}>
          {dados.candidaturas.total === 0 && periodo !== 'tudo' && (
            <AvisoSemDados periodo={periodo} onVerTudo={() => setPeriodo('tudo')} />
          )}

          <ResumoNumeros
            metricas={[
              {
                rotulo: 'Candidaturas',
                valor: String(dados.candidaturas.total),
                detalhe: `Recebidas ${descricaoPeriodo(periodo)}`,
              },
              {
                rotulo: 'Taxa de aprovação',
                valor: formatarPercentual(dados.candidaturas.taxaAprovacao),
                detalhe: detalheTaxa(dados.candidaturas),
              },
              {
                rotulo: 'Em análise',
                valor: String(dados.candidaturas.porStatus.em_analise),
                detalhe: 'Aguardando decisão',
              },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Bloco titulo="Funil de candidaturas" descricao="Candidaturas em cada etapa do processo.">
              <GraficoBarras
                orientacao="horizontal"
                legenda="Candidaturas por etapa"
                rotuloItem="Etapa"
                rotuloValor="Candidaturas"
                itens={itensFunil(dados.candidaturas.porStatus)}
              />
            </Bloco>
            <BlocoSerie serie={dados.serie} />
          </div>

          <Bloco titulo="Candidatos" descricao="Em ordem de etapa e, dentro dela, de inscrição.">
            <TabelaCandidatos candidatos={dados.candidatos} periodo={periodo} />
          </Bloco>
        </div>
      )}
    </LayoutRelatorio>
  );
}

function descricaoVaga(vaga: Dados['vaga']) {
  const partes = [vaga.area, rotuloStatusVaga(vaga.status)];
  if (vaga.criadoEm) partes.push(`criada em ${formatarData(vaga.criadoEm)}`);
  return partes.join(' · ');
}

function TabelaCandidatos({ candidatos, periodo }: { candidatos: Dados['candidatos']; periodo: Periodo }) {
  if (candidatos.length === 0) {
    return <p className="text-[13px] text-on-surface-variant">Nenhuma candidatura {descricaoPeriodo(periodo)}.</p>;
  }

  return (
    <Table className="text-[13px]">
      <TableCaption className="sr-only">Candidatos da vaga por etapa</TableCaption>
      <TableHeader>
        <TableRow className="border-outline-variant hover:bg-transparent">
          <TableHead>Candidato</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead className="text-right">Inscrição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidatos.map((c, i) => {
          const cfg = STATUS_CANDIDATURA_CONFIG[c.status];
          return (
            <TableRow key={`${c.inscritoEm}-${i}`} className="break-inside-avoid border-outline-variant">
              <TableCell className="text-on-surface">
                {c.nome ?? <span className="italic text-on-surface-variant">Candidato removido</span>}
              </TableCell>
              <TableCell>
                <Badge className={cn('whitespace-nowrap border-none text-[11px]', cfg.badge)}>{cfg.label}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums text-on-surface-variant">{formatarData(c.inscritoEm)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
