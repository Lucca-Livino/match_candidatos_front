import { useEffect, useState } from 'react';
import { UserRound, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FormDialog, Field } from './FormDialog';
import { getUsuario, updateUsuario } from '../api';
import type { UsuarioPerfil } from '../types';

export function DadosSection({ userId }: { userId: string }) {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome]     = useState('');
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getUsuario(userId)
      .then(setUsuario)
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [userId]);

  function openEdit() {
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha('');
    setSaveError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: { nome?: string; email?: string; senha?: string } = {};
      if (nome !== usuario?.nome)   payload.nome = nome;
      if (email !== usuario?.email) payload.email = email;
      if (senha.trim())             payload.senha = senha.trim();

      if (Object.keys(payload).length === 0) {
        setDialogOpen(false);
        return;
      }

      const updated = await updateUsuario(userId, payload);
      setUsuario((prev) => ({ ...prev, ...updated }));
      // atualiza cache do useAuth p/ refletir no header
      const cached = localStorage.getItem('auth_user');
      if (cached) {
        try {
          const u = JSON.parse(cached);
          localStorage.setItem('auth_user', JSON.stringify({ ...u, name: updated.nome, email: updated.email }));
        } catch { /* ignore */ }
      }
      setDialogOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold text-primary">
            <span className="text-secondary"><UserRound className="h-4 w-4" /></span>
            Dados pessoais
          </h2>
          {usuario && (
            <Button variant="outline" size="sm" onClick={openEdit} className="rounded-xl gap-1.5 text-[13px]">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <p className="text-[13px] text-red-600 py-2">{error}</p>
        ) : usuario ? (
          <div className="space-y-1">
            <p className="text-[17px] font-semibold text-primary">{usuario.nome}</p>
            <p className="text-[14px] text-on-surface-variant">{usuario.email}</p>
            {usuario.tipos_permissao && usuario.tipos_permissao.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {usuario.tipos_permissao.map((t) => (
                  <Badge key={t} className="rounded-full text-xs font-medium px-3 py-0.5 border-none bg-gray-100 text-gray-600 capitalize">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Editar dados pessoais"
        loading={saving}
        error={saveError}
        onSubmit={handleSave}
      >
        <Field label="Nome">
          <Input value={nome} maxLength={120} required onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={email} maxLength={180} required onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Nova senha (deixe em branco para manter)">
          <Input type="password" value={senha} minLength={8} placeholder="Mínimo 8 caracteres"
            onChange={(e) => setSenha(e.target.value)} />
        </Field>
      </FormDialog>
    </>
  );
}
