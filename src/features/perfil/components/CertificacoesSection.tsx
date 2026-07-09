import { useState } from 'react';
import { Award, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectionShell } from './SectionShell';
import { FormDialog, Field } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { useCrud } from '../hooks/useCrud';
import { listCertificacoes, createCertificacao, updateCertificacao, deleteCertificacao } from '../api';
import type { Certificacao, CertificacaoPayload } from '../types';

const EMPTY: CertificacaoPayload = {
  nome: '', emissor: '', dataEmissao: null, dataExpiracao: null, codigo: '',
};

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

function fmt(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : null;
}

export function CertificacoesSection({ userId }: { userId: string }) {
  const { items, loading, error, reload } = useCrud<Certificacao>(userId, listCertificacoes);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Certificacao | null>(null);
  const [form, setForm] = useState<CertificacaoPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Certificacao | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setSaveError(null);
    setDialogOpen(true);
  }

  function openEdit(c: Certificacao) {
    setEditing(c);
    setForm({
      nome: c.nome, emissor: c.emissor, codigo: c.codigo ?? '',
      dataEmissao: toDateInput(c.dataEmissao) || null,
      dataExpiracao: toDateInput(c.dataExpiracao) || null,
    });
    setSaveError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: CertificacaoPayload = {
        ...form,
        dataEmissao: form.dataEmissao || null,
        dataExpiracao: form.dataExpiracao || null,
      };
      if (editing) await updateCertificacao(userId, editing.id, payload);
      else         await createCertificacao(userId, payload);
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
        title="Certificações"
        icon={<Award className="h-4 w-4" />}
        onAdd={openCreate}
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyText="Adicione suas certificações."
      >
        {items.map((c) => {
          const emissao = fmt(c.dataEmissao);
          const exp = fmt(c.dataExpiracao);
          return (
            <div key={c.id} className="flex items-start justify-between gap-3 p-4 bg-[#f8f9fc] rounded-xl">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-primary">{c.nome}</p>
                <p className="text-[13px] text-on-surface-variant">{c.emissor}</p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {emissao && `Emitida em ${emissao}`}
                  {exp && ` · expira em ${exp}`}
                  {c.codigo && ` · cód. ${c.codigo}`}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-primary transition-colors" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setToDelete(c)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-white hover:text-red-600 transition-colors" aria-label="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </SectionShell>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar certificação' : 'Nova certificação'}
        loading={saving}
        error={saveError}
        onSubmit={handleSave}
      >
        <Field label="Nome">
          <Input value={form.nome} maxLength={180} required
            onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Field>
        <Field label="Emissor">
          <Input value={form.emissor} maxLength={180} required
            onChange={(e) => setForm({ ...form, emissor: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data de emissão">
            <Input type="date" value={form.dataEmissao ?? ''}
              onChange={(e) => setForm({ ...form, dataEmissao: e.target.value || null })} />
          </Field>
          <Field label="Data de expiração">
            <Input type="date" value={form.dataExpiracao ?? ''}
              onChange={(e) => setForm({ ...form, dataExpiracao: e.target.value || null })} />
          </Field>
        </div>
        <Field label="Código (opcional)">
          <Input value={form.codigo} maxLength={120}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Excluir certificação?"
        description={toDelete ? `${toDelete.nome} — ${toDelete.emissor}` : ''}
        onConfirm={async () => {
          if (toDelete) { await deleteCertificacao(userId, toDelete.id); setToDelete(null); await reload(); }
        }}
      />
    </>
  );
}
