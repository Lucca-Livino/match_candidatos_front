import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PERIODOS, ehPeriodo } from '../format';
import type { Periodo } from '../types';

interface FiltroPeriodoProps {
  valor: Periodo;
  onChange: (periodo: Periodo) => void;
}

export function FiltroPeriodo({ valor, onChange }: FiltroPeriodoProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={valor}
      // Radix devolve '' ao clicar no item já ativo: ignorar mantém sempre um período.
      onValueChange={v => { if (ehPeriodo(v)) onChange(v); }}
      aria-label="Período do relatório"
      className="grid grid-cols-2 bg-white sm:inline-flex"
    >
      {PERIODOS.map(p => (
        <ToggleGroupItem
          key={p.valor}
          value={p.valor}
          className="px-3 text-[13px] font-semibold data-[state=on]:bg-primary data-[state=on]:text-white"
        >
          {p.rotulo}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
