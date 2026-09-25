import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vaga } from '@/features/vagas/types';

const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
  ativa:     { label: 'Ativa',     dot: 'bg-emerald-400' },
  aberta:    { label: 'Ativa',     dot: 'bg-emerald-400' },
  pausada:   { label: 'Pausada',   dot: 'bg-yellow-400'  },
  arquivada: { label: 'Encerrada', dot: 'bg-gray-300'    },
};

export function VagaCandidatoCard({ vaga }: { vaga: Vaga }) {
  const navigate = useNavigate();

  const statusKey = vaga.status?.toLowerCase() ?? 'ativa';
  const status = STATUS_LABEL[statusKey] ?? STATUS_LABEL['ativa'];

  const date = vaga.criadoEm
    ? new Date(vaga.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="px-5 pt-5 pb-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <Badge className="rounded-full text-xs font-medium px-3 py-0.5 border-none bg-gray-100 text-gray-600">
            {vaga.area ?? '—'}
          </Badge>
          <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', status.dot)} />
            {status.label}
          </span>
        </div>

        <h3 className="text-[16px] font-semibold text-primary leading-snug mb-2 group-hover:text-secondary transition-colors">
          {vaga.titulo}
        </h3>

        {vaga.descricao && (
          <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
            {vaga.descricao}
          </p>
        )}

        {(vaga.criterio_vaga?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vaga.criterio_vaga!.slice(0, 3).map((c, i) => (
              <span
                key={c._id ?? i}
                className="text-[11px] bg-surface-container text-on-surface-variant rounded-full px-2.5 py-0.5"
              >
                {c.nome}
              </span>
            ))}
            {(vaga.criterio_vaga?.length ?? 0) > 3 && (
              <span className="text-[11px] text-on-surface-variant">
                +{(vaga.criterio_vaga?.length ?? 0) - 3} mais
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-5 pb-3 flex items-center gap-4 text-[12px] text-on-surface-variant">
        {vaga.localizacao && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {vaga.localizacao}
          </span>
        )}
        {date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {date}
          </span>
        )}
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-50 mt-2">
        <Button
          className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-xl h-10 text-[13px] font-medium hover:opacity-90 transition-opacity"
          onClick={() => navigate(`/vagas/${vaga.id}`)}
        >
          Candidatar-se
        </Button>
      </div>
    </div>
  );
}
