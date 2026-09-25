import { useState } from 'react';
import { Briefcase, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionShell } from './SectionShell';
import { FormDialog, Field } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { useCrud } from '../hooks/useCrud';
import { listExperiencias, createExperiencia, updateExperiencia, deleteExperiencia } from '../api';
import type { Experiencia, ExperienciaPayload } from '../types';

const EMPTY: ExperienciaPayload = {
  empresa: '', cargo: '', descricaoAtivida_: '', dataInicio: '', dataFim: null,
};

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

function fmt(iso: string | null): string {
  if (!iso) return 'atual';
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export function ExperienciaSection({ userId }: { userId: string }) {
  const { items, loading, error, reload } = useCrud<Experiencia>(userId, listExperiencias);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Experiencia | null>(null);
  const [form, setForm] = useState<ExperienciaPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Experiencia | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setSaveError(null);
    setDialogOpen(true);
  }

  function openEdit(x: Experiencia) {
    setEditing(x);
    setForm({
      empresa: x.empresa, cargo: x.cargo, descricaoAtivida_: x.descricaoAtivida_,
      dataInicio: toDateInput(x.dataInicio), dataFim: toDateInput(x.dataFim) || null,
    });
    setSaveError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: ExperienciaPayload = { ...form, dataFim: form.dataFim || null };
      if (editing) await updateExperiencia(userId, editing.id, payload);
      else         await createExperiencia(userId, payload);
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
        title="Experiência profissional"
        icon={<Briefcase className="h-4 w-4" />}
        onAdd={openCreate}
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyText="Adicione sua experiência profissional."
      >
        {items.map((x) => (
          <div key={x.id} className="flex items-start justify-between gap-3 p-4 bg-[#f8f9fc] rounded-xl">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-primary">{x.cargo}</p>
              <p className="text-[13px] text-on-surface-variant">{x.empresa}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">
                {fmt(x.dataInicio)} – {fmt(x.dataFim)}
              </p>
              {x.descricaoAtivida_ && (
                <p className="text-[12px] text-on-surface-variant mt-1.5 line-clamp-2">{x.descricaoAtivida_}</p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(x)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-primary transition-colors" aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => setToDelete(x)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-red-600 transition-colors" aria-label="Excluir">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </SectionShell>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar experiência' : 'Nova experiência'}
        loading={saving}
        error={saveError}
        onSubmit={handleSave}
      >
        <Field label="Empresa">
          <Input value={form.empresa} maxLength={180} required
            onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
        </Field>
        <Field label="Cargo">
          <Input value={form.cargo} maxLength={180} required
            onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
        </Field>
        <Field label="Descrição das atividades">
          <Textarea value={form.descricaoAtivida_} maxLength={3000} required rows={4}
            onChange={(e) => setForm({ ...form, descricaoAtivida_: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início">
            <Input type="date" value={form.dataInicio} required
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
          </Field>
          <Field label="Fim">
            <Input type="date" value={form.dataFim ?? ''} placeholder="Atual"
              onChange={(e) => setForm({ ...form, dataFim: e.target.value || null })} />
          </Field>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Excluir experiência?"
        description={toDelete ? `${toDelete.cargo} — ${toDelete.empresa}` : ''}
        onConfirm={async () => {
          if (toDelete) { await deleteExperiencia(userId, toDelete.id); setToDelete(null); await reload(); }
        }}
      />
    </>
  );
}
