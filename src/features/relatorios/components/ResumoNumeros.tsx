import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface Metrica {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

export function ResumoNumeros({ metricas }: { metricas: Metrica[] }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metricas.map(m => (
        <Card key={m.rotulo} className="break-inside-avoid rounded-md border-outline-variant shadow-none">
          <CardHeader className="pb-2">
            <dt className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">{m.rotulo}</dt>
          </CardHeader>
          <CardContent>
            <dd className="text-[32px] font-black leading-none tabular-nums text-primary">{m.valor}</dd>
            {m.detalhe && <dd className="mt-2 text-[13px] text-on-surface-variant">{m.detalhe}</dd>}
          </CardContent>
        </Card>
      ))}
    </dl>
  );
}
