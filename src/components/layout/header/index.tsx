import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, papelDe, homeDoPapel, loginDoPapel } from '@/features/auth';
import { Navigation } from './navigation';
import { UserMenu } from './user-menu';

interface NavItem {
  label: string;
  path: string;
}

interface HeaderProps {
  navItems: readonly NavItem[];
}

function logout(navigate: ReturnType<typeof useNavigate>, loginPath: string) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  navigate(loginPath, { replace: true });
}

export function Header({ navItems }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  const papel = papelDe(user);
  const isCandidato = papel === 'candidato';
  const areaLabel = papel === 'candidato' ? 'CANDIDATO' : papel === 'suporte' ? 'SUPORTE' : 'RECRUTADOR';
  const homePath = homeDoPapel(papel);
  const loginPath = loginDoPapel(papel);

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black py-2 px-8 text-[10px] font-semibold uppercase tracking-[0.15em] text-white flex justify-between items-center">
        <span>
          {loading
            ? 'Carregando...'
            : `BEM-VINDO, ${user?.name?.split(' ')[0]?.toUpperCase() ?? 'USUÁRIO'} | ${areaLabel}`}
        </span>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-20 border-b border-outline-variant bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-full items-center justify-between px-8 max-w-[1400px]">
          <button onClick={() => navigate(homePath)} className="flex flex-col leading-none">
            <span className="text-[20px] font-black tracking-[-0.02em] text-primary">RECURSOS</span>
            <span className="text-[20px] font-normal text-primary">HUMANOS</span>
          </button>

          <Navigation items={navItems} activePath={pathname} />

          <UserMenu
            user={user}
            loading={loading}
            perfilPath="/perfil"
            showPerfil={isCandidato}
            onLogout={() => logout(navigate, loginPath)}
          />
        </div>
      </header>
    </>
  );
}
