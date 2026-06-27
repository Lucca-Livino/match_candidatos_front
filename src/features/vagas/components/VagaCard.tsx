import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vaga } from '../types';
import { AREA_BADGE, STATUS_CONFIG, FINISHED_STATUSES } from '../constants';

interface VagaCardProps {
  vaga: Vaga;
}

export function VagaCard({ vaga }: VagaCardProps) {
  const navigate = useNavigate();

  const statusKey = vaga.status?.toLowerCase() ?? 'ativa';
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['ativa'];
  const areaKey = vaga.area?.toUpperCase() ?? '';
  const areaBadgeClass = AREA_BADGE[areaKey] ?? 'bg-gray-50 text-gray-600';
  const isFinished = FINISHED_STATUSES.includes(statusKey);

  const date = vaga.criadoEm
    ? new Date(vaga.criadoEm)
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace('.', '')
    : null;

  return (
    <div
      className={cn(
        'bg-white border border-outline-variant rounded-md flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow',
        'border-l-4',
        cfg.border
      )}
    >
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <Badge className={cn('text-[10px] font-bold uppercase tracking-wider border-none', areaBadgeClass)}>
          {areaKey || '—'}
        </Badge>
        <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1 text-on-surface-variant">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-5 pb-4">
        <h3 className="text-[17px] font-bold text-primary leading-snug">{vaga.titulo}</h3>
      </div>

      <div className="px-5 pb-3 flex items-center gap-4 text-[12px] text-on-surface-variant">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          {vaga.totalCandidatos ?? 0} Candidatos
        </span>
        {date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            {date}
          </span>
        )}
      </div>

      <div className="px-5 pb-4">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <span className={cn('h-2 w-2 rounded-full flex-shrink-0', cfg.dot)} />
          <span className="text-on-surface-variant">{cfg.label}</span>
        </span>
      </div>

      <div className="border-t border-outline-variant mt-auto">
        <div className="flex items-center px-4 py-3 gap-2">
          {isFinished ? (
            <>
              <Button
                size="sm"
                className="bg-[#1a2b45] text-white hover:bg-[#1a2b45]/90 text-[11px] font-bold uppercase tracking-wider h-8"
                onClick={() => navigate(`/vagas/${vaga.id}/relatorio`)}
              >
                Relatório
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-[11px] font-bold uppercase tracking-wider h-8 text-on-surface-variant hover:text-on-surface"
                onClick={() => navigate(`/vagas/${vaga.id}/duplicar`)}
              >
                Duplicar
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 text-[11px] font-bold uppercase tracking-wider h-8"
                onClick={() => navigate(`/vagas/${vaga.id}/candidatos`)}
              >
                Ver Candidatos
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-[11px] font-bold uppercase tracking-wider h-8 text-on-surface-variant hover:text-on-surface"
                onClick={() => navigate(`/vagas/${vaga.id}/editar`)}
              >
                Editar Vaga
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
