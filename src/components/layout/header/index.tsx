import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Navigation } from './navigation';
import { UserMenu } from './user-menu';

interface NavItem {
  label: string;
  path: string;
}

interface HeaderProps {
  navItems: readonly NavItem[];
}

function logout(navigate: ReturnType<typeof useNavigate>) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  navigate('/login', { replace: true });
}

export function Header({ navItems }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black py-2 px-8 text-[10px] font-semibold uppercase tracking-[0.15em] text-white flex justify-between items-center">
        <span>
          {loading
            ? 'Carregando...'
            : `BEM-VINDO, ${user?.name?.split(' ')[0]?.toUpperCase() ?? 'USUÁRIO'} | RECRUTADOR`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout(navigate)}
          className="flex items-center gap-1 text-white/60 hover:text-white hover:bg-transparent transition-colors text-[10px] uppercase tracking-wider h-auto p-0"
        >
          <LogOut className="h-3 w-3" />
          Sair
        </Button>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-20 border-b border-outline-variant bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-full items-center justify-between px-8 max-w-[1400px]">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col leading-none">
            <span className="text-[20px] font-black tracking-[-0.02em] text-primary">RECURSOS</span>
            <span className="text-[20px] font-normal text-primary">HUMANOS</span>
          </button>

          <Navigation items={navItems} activePath={pathname} />

          <UserMenu user={user} loading={loading} />
        </div>
      </header>
    </>
  );
}
