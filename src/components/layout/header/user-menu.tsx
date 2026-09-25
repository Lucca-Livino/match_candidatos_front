import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/features/auth';

interface UserMenuProps {
  user: AuthUser | null;
  loading: boolean;
  perfilPath: string;
  showPerfil?: boolean;
  onLogout: () => void;
}

export function UserMenu({ user, loading, perfilPath, showPerfil = true, onLogout }: UserMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickFora);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickFora);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="relative text-on-surface-variant hover:text-on-surface">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-error" />
      </Button>
      <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface">
        <Settings className="h-5 w-5" />
      </Button>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Avatar className="h-10 w-10 border border-outline-variant cursor-pointer">
            {user?.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-primary text-white text-sm font-bold">
              {loading ? '?' : initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown
            className={cn('h-4 w-4 text-on-surface-variant transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border border-outline-variant bg-white shadow-lg py-1.5 z-50"
          >
            {user && (
              <div className="px-4 py-2 border-b border-outline-variant">
                <p className="text-[13px] font-semibold text-primary truncate">{user.name}</p>
                <p className="text-[12px] text-on-surface-variant truncate">{user.email}</p>
              </div>
            )}

            {showPerfil && (
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); navigate(perfilPath); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-on-surface hover:bg-muted/50 transition-colors"
              >
                <User className="h-4 w-4 text-on-surface-variant" />
                Meu Perfil
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-error hover:bg-error/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
