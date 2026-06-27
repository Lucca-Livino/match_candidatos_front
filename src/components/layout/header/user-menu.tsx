import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Settings } from 'lucide-react';
import type { AuthUser } from '@/features/auth';

interface UserMenuProps {
  user: AuthUser | null;
  loading: boolean;
}

export function UserMenu({ user, loading }: UserMenuProps) {
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="relative text-on-surface-variant hover:text-on-surface">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-error" />
      </Button>
      <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface">
        <Settings className="h-5 w-5" />
      </Button>
      <Avatar
        className="h-10 w-10 border border-outline-variant cursor-pointer"
        onClick={() => navigate('/perfil')}
      >
        {user?.image && <AvatarImage src={user.image} alt={user.name} />}
        <AvatarFallback className="bg-primary text-white text-sm font-bold">
          {loading ? '?' : initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
