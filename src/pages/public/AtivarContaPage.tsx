import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ativarConta } from '@/features/usuarios';

// Espelha a regra da API (validateAtivacao). A API continua sendo quem decide;
// a lista aqui só evita uma ida ao servidor para descobrir o óbvio.
const REGRAS = [
  { texto: 'De 8 a 128 caracteres', ok: (s: string) => s.length >= 8 && s.length <= 128 },
  { texto: 'Uma letra maiúscula', ok: (s: string) => /[A-Z]/.test(s) },
  { texto: 'Uma letra minúscula', ok: (s: string) => /[a-z]/.test(s) },
  { texto: 'Um número', ok: (s: string) => /\d/.test(s) },
  { texto: 'Um caractere especial', ok: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

export default function AtivarContaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // O token é lido uma única vez e mantido em estado; a URL é limpa logo após
  // a montagem para que ele não fique no histórico nem na barra de endereço.
  const [token] = useState(() => params.get('token') ?? '');

  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  const senhaValida = REGRAS.every((r) => r.ok(senha));
  const confere = senha === confirmacao;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaValida || !confere) return;
    setEnviando(true);
    setErro(null);
    try {
      await ativarConta(token, senha);
      // Encerra qualquer outra sessão deste navegador: /login redireciona quem tem token.
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setConcluido(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível ativar a conta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-[32px] font-black tracking-[-0.04em] text-primary">Ativar conta</h1>

        {!token ? (
          <p className="flex items-start gap-2 text-[14px] text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            Link incompleto. Abra o link exatamente como veio no e-mail ou peça um novo convite ao administrador.
          </p>
        ) : concluido ? (
          <div className="space-y-6">
            <p className="flex items-start gap-2 text-[14px] text-emerald-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              Senha definida. Sua conta está ativa.
            </p>
            <Button className="h-12 w-full rounded-sm" onClick={() => navigate('/login', { replace: true })}>
              Ir para o login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[14px] text-on-surface-variant">Defina a senha que você vai usar para entrar.</p>

            <div className="space-y-2">
              <Label htmlFor="senha">Nova senha</Label>
              <Input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>

            <ul className="space-y-1 text-[12px]">
              {REGRAS.map((r) => (
                <li key={r.texto} className={r.ok(senha) ? 'text-emerald-700' : 'text-on-surface-variant'}>
                  {r.ok(senha) ? '✓' : '•'} {r.texto}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Label htmlFor="confirmacao">Confirme a senha</Label>
              <Input id="confirmacao" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} required />
              {confirmacao && !confere && <p className="text-[12px] text-red-600">As senhas não conferem.</p>}
            </div>

            {erro && (
              <p className="flex items-start gap-2 text-[13px] text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{erro}
              </p>
            )}

            <Button type="submit" className="h-12 w-full rounded-sm" disabled={enviando || !senhaValida || !confere}>
              {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ativar conta
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
