import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { AREAS, STATUSES } from '../constants';

export interface VagasFiltersProps {
  q: string;
  area: string;
  status: string;
  ordem: string;
  onQChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onOrdemChange: (v: string) => void;
}

export function VagasFilters({
  q, area, status, ordem,
  onQChange, onAreaChange, onStatusChange, onOrdemChange,
}: VagasFiltersProps) {
  return (
    <section className="border-b border-outline-variant bg-white shadow-sm">
      <div className="container mx-auto px-8 max-w-[1400px] py-5 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input
            value={q}
            onChange={e => onQChange(e.target.value)}
            placeholder="Buscar por título da vaga, ID ou palavra-chave..."
            className="pl-9 text-[13px] border-outline-variant"
          />
        </div>

        <Select value={area || '_all'} onValueChange={v => onAreaChange(v === '_all' ? '' : v)}>
          <SelectTrigger className="min-w-[160px] text-[13px] border-outline-variant">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Departamento</SelectItem>
            {AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={status || '_all'} onValueChange={v => onStatusChange(v === '_all' ? '' : v)}>
          <SelectTrigger className="min-w-[160px] text-[13px] border-outline-variant">
            <SelectValue placeholder="Status: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Status: Todos</SelectItem>
            {STATUSES.map(s => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ordem} onValueChange={onOrdemChange}>
          <SelectTrigger className="min-w-[180px] text-[13px] border-outline-variant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Ordenar: Recentes</SelectItem>
            <SelectItem value="antigos">Ordenar: Antigos</SelectItem>
            <SelectItem value="titulo">Ordenar: Título</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
