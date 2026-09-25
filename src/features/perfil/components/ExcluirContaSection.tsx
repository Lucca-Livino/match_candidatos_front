import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { loginDoPapel, type Papel } from '@/features/auth';
import { excluirMinhaConta } from '../api';
import { Field } from './FormDialog';

interface ExcluirContaSectionProps {
  /** Email da conta autenticada: é o que a pessoa precisa digitar para confirmar. */
  email: string;
  papel: Papel | null;
}

export function ExcluirContaSection({ email, papel }: ExcluirContaSectionProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mesma normalização do back-end, para que o botão não fique travado por um
  // espaço colado junto do email ou por diferença de caixa.
  const confere = confirmacao.trim().toLowerCase() === email.trim().toLowerCase();

  function abrir() {
    setConfirmacao('');
    setError(null);
    setOpen(true);
  }

  async function handleExcluir() {
    setLoading(true);
    setError(null);
    try {
      await excluirMinhaConta(confirmacao.trim());
      // A sessão já morreu no servidor; limpar o cache local evita que a tela
      // seguinte tente reidratar o usuário a partir de um estado inválido.
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      navigate(loginDoPapel(papel), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir a conta.');
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-red-700 mb-2">
        <TriangleAlert className="h-4 w-4" />
        Excluir conta
      </h2>

      <p className="text-[13px] text-on-surface-variant mb-4 max-w-[640px]">
        Seus dados pessoais e todo o currículo (formações, experiências, habilidades e
        certificações) são apagados. As candidaturas que você já enviou continuam
        registradas nos processos seletivos, sem nenhum dado que identifique você.
        Esta ação não pode ser desfeita.
      </p>

      <Button
        variant="outline"
        className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
        onClick={abrir}
      >
        Excluir minha conta
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!loading) setOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir sua conta</DialogTitle>
            <DialogDescription>
              Para confirmar, digite o email da sua conta: <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>

          <Field label="Email da conta">
            <Input
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={email}
              autoComplete="off"
              disabled={loading}
            />
          </Field>

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={loading || !confere}
              onClick={handleExcluir}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
