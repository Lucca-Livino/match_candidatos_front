import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convidarUsuario } from '../api';
import type { PapelConvidavel } from '../types';

interface ConvidarUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvidado: (email: string) => void;
}

export function ConvidarUsuarioDialog({ open, onOpenChange, onConvidado }: ConvidarUsuarioDialogProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState<PapelConvidavel>('recrutador');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function limpar() {
    setNome('');
    setEmail('');
    setPapel('recrutador');
    setErro(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await convidarUsuario({ nome: nome.trim(), email: email.trim(), papel });
      onConvidado(email.trim());
      limpar();
      onOpenChange(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar o convite.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (enviando) return;
        if (!o) limpar();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>
            A pessoa recebe um e-mail com o link para definir a senha. O link vale por 24 horas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="convite-nome">Nome</Label>
            <Input id="convite-nome" value={nome} onChange={(e) => setNome(e.target.value)} minLength={2} maxLength={120} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="convite-email">E-mail</Label>
            <Input id="convite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="convite-papel">Papel</Label>
            <Select value={papel} onValueChange={(v) => setPapel(v as PapelConvidavel)}>
              <SelectTrigger id="convite-papel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recrutador">Recrutador</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {erro && <p className="text-[13px] text-red-600">{erro}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-xl" disabled={enviando} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl" disabled={enviando}>
              {enviando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
