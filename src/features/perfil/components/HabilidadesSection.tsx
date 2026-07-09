import { useState } from 'react';
import { Sparkles, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SectionShell } from './SectionShell';
import { FormDialog, Field } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { useCrud } from '../hooks/useCrud';
import { listHabilidades, createHabilidade, updateHabilidade, deleteHabilidade } from '../api';
import { NIVEL_OPTIONS, NIVEL_LABEL, NIVEL_BADGE } from '../constants';
import type { Habilidade, HabilidadePayload, NivelHabilidade } from '../types';

const EMPTY: HabilidadePayload = { habilidade: '', nivel: 'intermediario' };

export function HabilidadesSection({ userId }: { userId: string }) {
  const { items, loading, error, reload } = useCrud<Habilidade>(userId, listHabilidades);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Habilidade | null>(null);
  const [form, setForm] = useState<HabilidadePayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Habilidade | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setSaveError(null);
    setDialogOpen(true);
  }

  function openEdit(h: Habilidade) {
    setEditing(h);
    setForm({ habilidade: h.habilidade, nivel: h.nivel });
    setSaveError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await updateHabilidade(userId, editing.id, form);
      else         await createHabilidade(userId, form);
      setDialogOpen(false);
      await reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionShell
        title="Habilidades"
        icon={<Sparkles className="h-4 w-4" />}
        onAdd={openCreate}
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyText="Adicione suas habilidades."
      >
        <div className="flex flex-wrap gap-2">
          {items.map((h) => (
            <span key={h.id} className={cn('group inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-medium', NIVEL_BADGE[h.nivel])}>
              {h.habilidade}
              <span className="opacity-60 text-[11px]">· {NIVEL_LABEL[h.nivel]}</span>
              <button onClick={() => openEdit(h)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Editar">
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={() => setToDelete(h)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Excluir">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </SectionShell>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar habilidade' : 'Nova habilidade'}
        loading={saving}
        error={saveError}
        onSubmit={handleSave}
      >
        <Field label="Habilidade">
          <Input value={form.habilidade} maxLength={120} required placeholder="Ex: React, SQL, Inglês"
            onChange={(e) => setForm({ ...form, habilidade: e.target.value })} />
        </Field>
        <Field label="Nível">
          <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v as NivelHabilidade })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {NIVEL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Excluir habilidade?"
        description={toDelete?.habilidade ?? ''}
        onConfirm={async () => {
          if (toDelete) { await deleteHabilidade(userId, toDelete.id); setToDelete(null); await reload(); }
        }}
      />
    </>
  );
}
