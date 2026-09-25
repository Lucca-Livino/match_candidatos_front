import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OpcaoForm, PerguntaForm, TipoResposta } from '../types';
import { TIPOS_RESPOSTA, OPCOES_VF } from '../constants';

function opcoesParaTipo(tipo: TipoResposta): OpcaoForm[] {
  if (tipo === 'verdadeiro_falso') {
    return OPCOES_VF.map((texto, i) => ({ texto, correta: i === 0 }));
  }
  if (tipo === 'multipla_escolha') {
    return [
      { texto: '', correta: true },
      { texto: '', correta: false },
    ];
  }
  return [];
}

interface PerguntaEditorProps {
  pergunta: PerguntaForm;
  index: number;
  total: number;
  onChange: (next: PerguntaForm) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function PerguntaEditor({
  pergunta,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: PerguntaEditorProps) {
  const isVF = pergunta.tipoResposta === 'verdadeiro_falso';
  const isMultipla = pergunta.tipoResposta === 'multipla_escolha';

  function patch<K extends keyof PerguntaForm>(key: K, value: PerguntaForm[K]) {
    onChange({ ...pergunta, [key]: value });
  }

  function changeTipo(tipo: TipoResposta) {
    onChange({ ...pergunta, tipoResposta: tipo, opcoes: opcoesParaTipo(tipo) });
  }

  function updateOpcao(idx: number, patchOpc: Partial<OpcaoForm>) {
    patch(
      'opcoes',
      pergunta.opcoes.map((o, i) => (i === idx ? { ...o, ...patchOpc } : o)),
    );
  }

  function marcarCorreta(idx: number) {
    patch(
      'opcoes',
      pergunta.opcoes.map((o, i) => ({ ...o, correta: i === idx })),
    );
  }

  function addOpcao() {
    patch('opcoes', [...pergunta.opcoes, { texto: '', correta: false }]);
  }

  function removeOpcao(idx: number) {
    const restantes = pergunta.opcoes.filter((_, i) => i !== idx);
    // Garante que ao menos uma continue marcada como correta.
    if (!restantes.some((o) => o.correta) && restantes.length > 0) {
      restantes[0] = { ...restantes[0], correta: true };
    }
    patch('opcoes', restantes);
  }

  const radioName = `correta-${index}`;

  return (
    <div className="border border-outline-variant rounded-md p-4 space-y-3 relative bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <GripVertical className="h-4 w-4 opacity-40" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Pergunta {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-on-surface-variant hover:text-primary disabled:opacity-30 transition-colors"
            aria-label="Mover para cima"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-on-surface-variant hover:text-primary disabled:opacity-30 transition-colors"
            aria-label="Mover para baixo"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-on-surface-variant hover:text-red-500 transition-colors ml-1"
            aria-label="Remover pergunta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] font-semibold">Enunciado *</Label>
        <textarea
          value={pergunta.enunciado}
          onChange={(e) => patch('enunciado', e.target.value)}
          placeholder="Digite o enunciado da pergunta..."
          minLength={3}
          maxLength={2000}
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[12px] font-semibold">Tipo *</Label>
          <Select
            value={pergunta.tipoResposta}
            onValueChange={(v) => changeTipo(v as TipoResposta)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_RESPOSTA.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[12px] font-semibold">Obrigatória</Label>
          <div className="flex items-center gap-2 h-9 px-3">
            <input
              type="checkbox"
              id={`obrig-perg-${index}`}
              checked={pergunta.obrigatoria}
              onChange={(e) => patch('obrigatoria', e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor={`obrig-perg-${index}`} className="text-[13px] text-on-surface-variant">
              Sim
            </label>
          </div>
        </div>
      </div>

      {/* Opções (múltipla escolha / verdadeiro-falso) */}
      {(isMultipla || isVF) && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] font-semibold">
              Opções {isMultipla && '(marque a correta)'}
            </Label>
            {isMultipla && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 text-[11px] font-bold uppercase tracking-wider h-7"
                onClick={addOpcao}
              >
                <Plus className="h-3 w-3" />
                Opção
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {pergunta.opcoes.map((o, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={radioName}
                  checked={o.correta}
                  onChange={() => marcarCorreta(idx)}
                  className="h-4 w-4 accent-emerald-600 flex-shrink-0"
                  aria-label="Marcar como correta"
                />
                <Input
                  value={o.texto}
                  onChange={(e) => updateOpcao(idx, { texto: e.target.value })}
                  placeholder={`Opção ${idx + 1}`}
                  disabled={isVF}
                  maxLength={1000}
                  className="flex-1"
                />
                {isMultipla && pergunta.opcoes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpcao(idx)}
                    className="text-on-surface-variant hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="Remover opção"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pergunta.tipoResposta === 'dissertativa' && (
        <p className="text-[12px] text-on-surface-variant italic">
          Resposta aberta — o candidato responderá em texto livre.
        </p>
      )}
    </div>
  );
}
