import { AlertCircle, Info, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { descricaoPeriodo } from '../format';
import type { Periodo } from '../types';

export function RelatorioCarregando() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando relatório">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-md" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-md" />
        <Skeleton className="h-56 rounded-md" />
      </div>
    </div>
  );
}

export function RelatorioErro({ mensagem, onTentar }: { mensagem: string; onTentar: () => void }) {
  return (
    <Alert variant="destructive" className="bg-white">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Relatório indisponível</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{mensagem}</span>
        <Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={onTentar}>
          <RotateCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function AvisoSemDados({ periodo, onVerTudo }: { periodo: Periodo; onVerTudo: () => void }) {
  return (
    <Alert role="status" className="bg-white print:hidden">
      <Info className="h-4 w-4" />
      <AlertTitle>Nenhuma candidatura {descricaoPeriodo(periodo)}.</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>Os números abaixo aparecem zerados para este período.</span>
        <Button variant="outline" size="sm" className="bg-white" onClick={onVerTudo}>Ver todo o período</Button>
      </AlertDescription>
    </Alert>
  );
}
