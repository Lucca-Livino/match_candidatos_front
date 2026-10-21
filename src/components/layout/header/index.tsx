import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, papelDe, homeDoPapel, loginDoPapel, perfilDoPapel } from '@/features/auth';
import { Navigation, MobileNavigation } from './navigation';
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
  const [menuAberto, setMenuAberto] = useState(false);

  const papel = papelDe(user);
  const homePath = homeDoPapel(papel);
  const loginPath = loginDoPapel(papel);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/70 backdrop-blur-xl print:hidden">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-8 max-w-[1400px]">
        <Link to={homePath} className="flex flex-col leading-none text-primary hover:opacity-100">
          <span className="text-[20px] font-black tracking-[-0.02em]">RECURSOS</span>
          <span className="text-[20px] font-normal">HUMANOS</span>
        </Link>

        <Navigation items={navItems} activePath={pathname} />

        <div className="flex items-center gap-2">
          <UserMenu
            user={user}
            loading={loading}
            perfilPath={perfilDoPapel(papel)}
            showPerfil={papel !== null}
            onLogout={() => logout(navigate, loginPath)}
          />
          {navItems.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-on-surface"
              aria-label="Menu"
              aria-expanded={menuAberto}
              aria-controls="menu-principal"
              onClick={() => setMenuAberto(a => !a)}
            >
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {menuAberto && (
        <MobileNavigation
          id="menu-principal"
          items={navItems}
          activePath={pathname}
          onNavigate={() => setMenuAberto(false)}
        />
      )}
    </header>
  );
}
