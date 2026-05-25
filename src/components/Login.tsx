import React, { useState } from 'react';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || 'Credenciais invalidas. Por favor, tente novamente.';
        setError(message);
        return;
      }

      const token = data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      if (data?.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      console.log('Login realizado com sucesso', data);
    } catch (err) {
      setError('Erro ao conectar com a API. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-side">
        <div className="login-form-wrapper">
          <header className="form-header">
            <h2 className="headline-xl">Bem-vindo de volta</h2>
            <p className="body-lg">Insira suas credenciais para acessar seu workspace.</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="label-caps">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                required
                className={error ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="label-caps">Senha</label>
                <a href="#" className="label-tiny">Esqueceu a senha?</a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={error ? 'input-error' : ''}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="label-tiny">{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>

          <footer className="form-footer">
            <p className="body-md">Não tem uma conta? <a href="#">Solicitar convite</a></p>
          </footer>
        </div>
      </div>
      
      <div className="login-editorial">
        <div className="editorial-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          alt="Workspace Editorial" 
          className="editorial-image" 
        />
        <div className="editorial-content">
          <span className="label-caps">Nova Editorial HR</span>
          <h1 className="display-hero">Precisão em Pessoas.</h1>
        </div>
      </div>
    </div>
  );
};

export default Login;
