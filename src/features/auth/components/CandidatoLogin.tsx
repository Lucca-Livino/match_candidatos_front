import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Briefcase } from "lucide-react";
import { useLoginForm } from '../hooks/useLoginForm';

export function CandidatoLogin() {
  const { email, setEmail, password, setPassword, isLoading, error, handleSubmit } = useLoginForm('/candidato');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Logo / ícone */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-[28px] font-bold text-primary text-center leading-tight">
            Encontre sua próxima<br />oportunidade
          </h1>
          <p className="text-[14px] text-on-surface-variant mt-2 text-center">
            Entre na sua conta para explorar vagas e acompanhar suas candidaturas.
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-on-surface">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-outline-variant bg-[#f8f9fc] px-4 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-[14px]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-on-surface">
                  Senha
                </Label>
                <a href="#" className="text-[12px] text-secondary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-outline-variant bg-[#f8f9fc] px-4 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-[14px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-[13px]">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50 mt-1"
            >
              {isLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>
                : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-[13px] text-on-surface-variant">
              Não tem conta?{' '}
              <a href="#" className="font-medium text-secondary hover:underline">Cadastre-se gratuitamente</a>
            </p>
          </div>
        </div>

        {/* Link cruzado */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[13px] text-on-surface-variant hover:text-primary transition-colors"
          >
            Sou recrutador →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CandidatoLogin;
