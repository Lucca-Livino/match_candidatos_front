import { useState } from 'react';
import { GraduationCap, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SectionShell } from './SectionShell';
import { FormDialog, Field } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { useCrud } from '../hooks/useCrud';
import { listFormacoes, createFormacao, updateFormacao, deleteFormacao } from '../api';
import {
  GRAU_OPTIONS,
  GRAU_LABEL,
  SITUACAO_OPTIONS,
  SITUACAO_LABEL,
  SITUACOES_COM_ANO_CONCLUSAO,
  periodoFormacao,
} from '../constants';
import type { Formacao, FormacaoPayload, GrauAcademico, SituacaoFormacao } from '../types';

// Situação começa vazia de propósito: um padrão pré-selecionado seria salvo
// sem o candidato perceber, e a situação muda o que a IA conclui do ano final.
type FormacaoForm = Omit<FormacaoPayload, 'situacao'> & { situacao: SituacaoFormacao | '' };

const EMPTY: FormacaoForm = {
  instituicao: '', curso: '', grau: 'graduacao', situacao: '', anoInicio: new Date().getFullYear(), anoConclusao: null,
};

const ROTULO_ANO_FINAL: Record<SituacaoFormacao | '', string> = {
  '':         'Ano de conclusão',
  cursando:   'Previsão de conclusão',
  concluido:  'Ano de conclusão',
  trancado:   'Ano de saída (opcional)',
  incompleto: 'Ano de saída (opcional)',
};

export function FormacaoSection({ userId }: { userId: string }) {
  const { items, loading, error, reload } = useCrud<Formacao>(userId, listFormacoes);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Formacao | null>(null);
  const [form, setForm] = useState<FormacaoForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Formacao | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setSaveError(null);
    setDialogOpen(true);
  }

  function openEdit(f: Formacao) {
    setEditing(f);
    setForm({
      instituicao: f.instituicao, curso: f.curso, grau: f.grau,
      // Registro antigo com texto livre abre sem situação e obriga a escolher.
      situacao: f.situacao in SITUACAO_LABEL ? f.situacao : '',
      anoInicio: f.anoInicio, anoConclusao: f.anoConclusao,
    });
    setSaveError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    // O Select não participa da validação nativa do <form>.
    if (!form.situacao) {
      setSaveError('Selecione a situação do curso.');
      return;
    }
    const payload: FormacaoPayload = { ...form, situacao: form.situacao };
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await updateFormacao(userId, editing.id, payload);
      else         await createFormacao(userId, payload);
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
        title="Formação acadêmica"
        icon={<GraduationCap className="h-4 w-4" />}
        onAdd={openCreate}
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyText="Adicione sua formação acadêmica."
      >
        {items.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-3 p-4 bg-[#f8f9fc] rounded-xl">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-primary">{f.curso}</p>
              <p className="text-[13px] text-on-surface-variant">{f.instituicao}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">
                {GRAU_LABEL[f.grau]} · {SITUACAO_LABEL[f.situacao] ?? f.situacao} · {periodoFormacao(f.anoInicio, f.anoConclusao, f.situacao)}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-primary transition-colors" aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => setToDelete(f)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-red-600 transition-colors" aria-label="Excluir">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </SectionShell>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar formação' : 'Nova formação'}
        loading={saving}
        error={saveError}
        onSubmit={handleSave}
      >
        <Field label="Instituição">
          <Input value={form.instituicao} maxLength={180} required
            onChange={(e) => setForm({ ...form, instituicao: e.target.value })} />
        </Field>
        <Field label="Curso">
          <Input value={form.curso} maxLength={180} required
            onChange={(e) => setForm({ ...form, curso: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grau">
            <Select value={form.grau} onValueChange={(v) => setForm({ ...form, grau: v as GrauAcademico })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRAU_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Situação">
            <Select value={form.situacao} onValueChange={(v) => setForm({ ...form, situacao: v as SituacaoFormacao })}>
              <SelectTrigger aria-label="Situação"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {SITUACAO_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ano de início">
            <Input type="number" value={form.anoInicio} min={1900} max={3000} required
              onChange={(e) => setForm({ ...form, anoInicio: Number(e.target.value) })} />
          </Field>
          <Field label={ROTULO_ANO_FINAL[form.situacao]}>
            <Input type="number" value={form.anoConclusao ?? ''} min={form.anoInicio || 1900} max={3000}
              required={form.situacao !== '' && SITUACOES_COM_ANO_CONCLUSAO.includes(form.situacao)}
              onChange={(e) => setForm({ ...form, anoConclusao: e.target.value ? Number(e.target.value) : null })} />
          </Field>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Excluir formação?"
        description={toDelete ? `${toDelete.curso} — ${toDelete.instituicao}` : ''}
        onConfirm={async () => {
          if (toDelete) { await deleteFormacao(userId, toDelete.id); setToDelete(null); await reload(); }
        }}
      />
    </>
  );
}
