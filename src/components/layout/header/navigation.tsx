import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
}

interface NavigationProps {
  items: NavItem[];
  activePath: string;
}

export function Navigation({ items, activePath }: NavigationProps) {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex gap-10">
      {items.map(({ label, path }) => (
        <button
          key={label}
          onClick={() => navigate(path)}
          className={cn(
            'text-[14px] font-medium pb-1 transition-colors',
            path === activePath
              ? 'text-on-surface border-b-2 border-on-surface'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
