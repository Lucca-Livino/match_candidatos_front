import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { COR_SERIE, type ItemGrafico } from '../cores';
import { TabelaAcessivel } from './TabelaAcessivel';

interface GraficoBarrasProps {
  itens: ItemGrafico[];
  /** horizontal: categorias (funil, status, área). vertical: série no tempo. */
  orientacao: 'horizontal' | 'vertical';
  legenda: string;
  rotuloItem: string;
  rotuloValor: string;
}

const ALTURA_BARRA = 36;

export function GraficoBarras({ itens, orientacao, legenda, rotuloItem, rotuloValor }: GraficoBarrasProps) {
  const config = { valor: { label: rotuloValor, color: COR_SERIE } } satisfies ChartConfig;
  const dados = itens.map(i => ({ rotulo: i.rotulo, valor: i.valor, fill: i.cor ?? 'var(--color-valor)' }));
  const horizontal = orientacao === 'horizontal';

  return (
    <>
      <ChartContainer
        config={config}
        aria-hidden="true"
        className={cn(
          'w-full aspect-auto',
          // Na impressão o SVG mantém a largura calculada na tela; max-w +
          // h-auto o encolhem proporcionalmente (o Recharts define viewBox).
          'print:[&_svg]:h-auto print:[&_svg]:max-w-full print:[&_.recharts-tooltip-wrapper]:hidden',
          horizontal ? '' : 'h-56',
        )}
        style={horizontal ? { height: itens.length * ALTURA_BARRA + 8 } : undefined}
      >
        {horizontal ? (
          <BarChart data={dados} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" dataKey="valor" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="rotulo"
              width={104}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="valor" radius={4} barSize={20}>
              <LabelList dataKey="valor" position="right" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={dados} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        )}
      </ChartContainer>
      <TabelaAcessivel
        legenda={legenda}
        cabecalhos={[rotuloItem, rotuloValor]}
        linhas={itens.map(i => [i.rotulo, String(i.valor)])}
      />
    </>
  );
}
