import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        credentials: 'include', // inclui cookies de sessão (better-auth)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || 'Credenciais inválidas. Por favor, tente novamente.';
        setError(message);
        return;
      }

      const token = data?.token;
      if (token) localStorage.setItem('auth_token', token);
      if (data?.user) localStorage.setItem('auth_user', JSON.stringify(data.user));

      onLoginSuccess();
    } catch {
      setError('Erro ao conectar com a API. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Form Side */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 lg:px-24">
        <div className="w-full max-w-md">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="p-0 mb-8 space-y-3">
              <CardTitle className="text-[36px] font-black tracking-[-0.04em] leading-[1.2] text-primary">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-body-lg text-on-surface-variant">
                Insira suas credenciais para acessar seu workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[12px] font-bold uppercase tracking-[0.3em] text-on-surface">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-sm border-outline-variant bg-surface-container-lowest px-4 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-[0.3em] text-on-surface">
                      Senha
                    </Label>
                    <a href="#" className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary hover:opacity-80">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-sm border-outline-variant bg-surface-container-lowest px-4 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-sm bg-error/10 p-3 text-error">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-12 w-full rounded-sm bg-gradient-to-r from-primary to-secondary text-[12px] font-bold uppercase tracking-[0.3em] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-0 mt-10 justify-center">
              <p className="text-[14px] text-on-surface-variant">
                Não tem uma conta? <a href="#" className="font-semibold text-secondary hover:underline">Solicitar convite</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Editorial Side */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 z-10 bg-navy-deep/55" />
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          alt="Workspace Editorial" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
          <span className="text-[12px] font-bold uppercase tracking-[0.3em] mb-4">Nova Editorial HR</span>
          <h1 className="text-[72px] font-extrabold leading-[1.1] tracking-[-0.05em]">Precisão em Pessoas.</h1>
        </div>
      </div>
    </div>
  );
};

export default Login;
