import { useState } from 'react';
import { Archive, Loader2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/features/perfil/components/ConfirmDialog';
import { updateVaga } from '../api';
import type { Vaga } from '../types';

interface AcoesStatusVagaProps {
  vaga: Vaga;
  onAlterado: (vaga: Vaga) => void;
  className?: string;
}

export function AcoesStatusVaga({ vaga, onAlterado, className }: AcoesStatusVagaProps) {
  const [salvando, setSalvando]           = useState<string | null>(null);
  const [erro, setErro]                   = useState<string | null>(null);
  const [confirmarEncerrar, setConfirmar] = useState(false);

  const status = vaga.status?.toLowerCase() ?? 'ativa';
  if (status !== 'ativa' && status !== 'pausada') return null;

  async function alterar(novo: string) {
    setSalvando(novo);
    setErro(null);
    try {
      onAlterado(await updateVaga(vaga.id, { status: novo }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao alterar o status da vaga.');
      throw err;
    } finally {
      setSalvando(null);
    }
  }

  const botao = 'h-7 gap-1 px-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1">
        {status === 'ativa' ? (
          <Button
            size="sm"
            variant="ghost"
            className={botao}
            disabled={salvando !== null}
            onClick={() => alterar('pausada').catch(() => {})}
          >
            {salvando === 'pausada' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
            Pausar
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className={botao}
            disabled={salvando !== null}
            onClick={() => alterar('ativa').catch(() => {})}
          >
            {salvando === 'ativa' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Ativar
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className={botao}
          disabled={salvando !== null}
          onClick={() => { setErro(null); setConfirmar(true); }}
        >
          <Archive className="h-3.5 w-3.5" />
          Encerrar
        </Button>
      </div>

      {erro && !confirmarEncerrar && (
        <p role="alert" className="text-[12px] text-red-600">{erro}</p>
      )}

      <ConfirmDialog
        open={confirmarEncerrar}
        onOpenChange={setConfirmar}
        title="Encerrar vaga?"
        description={`"${vaga.titulo}" sai do ar e não poderá ser reaberta.`}
        confirmLabel="Encerrar vaga"
        onConfirm={() => alterar('arquivada')}
      />
    </div>
  );
}
