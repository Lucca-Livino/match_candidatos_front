import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PerguntaForm, QuestionarioForm } from '../types';
import { emptyPerguntaForm } from '../factories';
import { PerguntaEditor } from './PerguntaEditor';

interface QuestionarioSectionProps {
  value: QuestionarioForm;
  onChange: (next: QuestionarioForm) => void;
}

export function QuestionarioSection({ value, onChange }: QuestionarioSectionProps) {
  function patch<K extends keyof QuestionarioForm>(key: K, val: QuestionarioForm[K]) {
    onChange({ ...value, [key]: val });
  }

  function updatePergunta(idx: number, next: PerguntaForm) {
    patch('perguntas', value.perguntas.map((p, i) => (i === idx ? next : p)));
  }

  function addPergunta() {
    patch('perguntas', [...value.perguntas, emptyPerguntaForm()]);
  }

  function removePergunta(idx: number) {
    patch('perguntas', value.perguntas.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= value.perguntas.length) return;
    const next = value.perguntas.slice();
    [next[idx], next[alvo]] = [next[alvo], next[idx]];
    patch('perguntas', next);
  }

  return (
    <div className="bg-white border border-outline-variant rounded-md p-6 space-y-5">
      <div className="flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-on-surface-variant" />
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
            Questionário *
          </h2>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            Perguntas que o candidato responderá ao se inscrever.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quest-titulo" className="text-[13px] font-semibold">Título *</Label>
        <Input
          id="quest-titulo"
          value={value.titulo}
          onChange={(e) => patch('titulo', e.target.value)}
          placeholder="Ex: Avaliação técnica inicial"
          minLength={3}
          maxLength={180}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quest-instrucoes" className="text-[13px] font-semibold">Instruções</Label>
        <textarea
          id="quest-instrucoes"
          value={value.instrucoes}
          onChange={(e) => patch('instrucoes', e.target.value)}
          placeholder="Orientações gerais para o candidato antes de responder..."
          maxLength={2000}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="quest-ativo"
          checked={value.ativo}
          onChange={(e) => patch('ativo', e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="quest-ativo" className="text-[13px] text-on-surface-variant">
          Questionário ativo (visível para candidatos)
        </label>
      </div>

      {/* Perguntas */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-on-surface-variant">
            Perguntas
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-[12px] font-bold uppercase tracking-wider"
            onClick={addPergunta}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Pergunta
          </Button>
        </div>

        {value.perguntas.length === 0 && (
          <p className="text-[13px] text-on-surface-variant text-center py-6">
            Adicione ao menos uma pergunta.
          </p>
        )}

        <div className="space-y-4">
          {value.perguntas.map((p, idx) => (
            <PerguntaEditor
              key={idx}
              pergunta={p}
              index={idx}
              total={value.perguntas.length}
              onChange={(next) => updatePergunta(idx, next)}
              onRemove={() => removePergunta(idx)}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
