import { rotuloPonto } from '../format';
import type { Serie } from '../types';
import { Bloco } from './Bloco';
import { GraficoBarras } from './GraficoBarras';

export function BlocoSerie({ serie }: { serie: Serie }) {
  return (
    <Bloco
      titulo="Candidaturas no tempo"
      descricao={serie.granularidade === 'semana' ? 'Por semana de inscrição.' : 'Por mês de inscrição.'}
    >
      {serie.pontos.length === 0 ? (
        <p className="text-[13px] text-on-surface-variant">Nenhuma candidatura registrada.</p>
      ) : (
        <GraficoBarras
          orientacao="vertical"
          legenda={serie.granularidade === 'semana' ? 'Candidaturas por semana' : 'Candidaturas por mês'}
          rotuloItem={serie.granularidade === 'semana' ? 'Semana de' : 'Mês'}
          rotuloValor="Candidaturas"
          itens={serie.pontos.map(p => ({ rotulo: rotuloPonto(p.inicio, serie.granularidade), valor: p.total }))}
        />
      )}
    </Bloco>
  );
}
