import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { getRelatorioGeral } from '../api';
import { useRelatorio } from '../hooks/useRelatorio';
import { descricaoPeriodo, detalheTaxa, formatarPercentual } from '../format';
import { itensFunil, itensStatusVaga } from '../cores';
import type { Periodo } from '../types';
import { LayoutRelatorio } from './LayoutRelatorio';
import { RelatorioCarregando, RelatorioErro, AvisoSemDados } from './EstadosRelatorio';
import { ResumoNumeros } from './ResumoNumeros';
import { Bloco } from './Bloco';
import { GraficoBarras } from './GraficoBarras';
import { BlocoSerie } from './BlocoSerie';

export function RelatorioGeral() {
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const buscar = useCallback(() => getRelatorioGeral(periodo), [periodo]);
  const { dados, loading, erro, recarregar } = useRelatorio(buscar);

  return (
    <LayoutRelatorio
      titulo="Relatórios"
      descricao="Acompanhe o andamento dos processos seletivos."
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
                rotulo: 'Vagas ativas',
                valor: String(dados.vagas.porStatus.ativa),
                detalhe: `De ${dados.vagas.total} criadas ${descricaoPeriodo(periodo)}`,
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
            <Bloco titulo="Vagas por status">
              <GraficoBarras
                orientacao="horizontal"
                legenda="Vagas por status"
                rotuloItem="Status"
                rotuloValor="Vagas"
                itens={itensStatusVaga(dados.vagas.porStatus)}
              />
            </Bloco>
          </div>

          <Bloco titulo="Vagas por área">
            {dados.vagas.porArea.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant">Nenhuma vaga criada {descricaoPeriodo(periodo)}.</p>
            ) : (
              <GraficoBarras
                orientacao="horizontal"
                legenda="Vagas por área"
                rotuloItem="Área"
                rotuloValor="Vagas"
                itens={dados.vagas.porArea.map(a => ({ rotulo: a.area, valor: a.total }))}
              />
            )}
          </Bloco>

          <BlocoSerie serie={dados.serie} />
        </div>
      )}
    </LayoutRelatorio>
  );
}
