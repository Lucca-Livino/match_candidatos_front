import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
}

interface NavigationProps {
  items: readonly NavItem[];
  activePath: string;
}

export function Navigation({ items, activePath }: NavigationProps) {
  return (
    <nav aria-label="Principal" className="hidden md:flex gap-10">
      {items.map(({ label, path }) => {
        const ativo = path === activePath;
        return (
          <Link
            key={label}
            to={path}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'text-[14px] font-medium pb-1 transition-colors hover:opacity-100',
              ativo
                ? 'text-on-surface border-b-2 border-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps extends NavigationProps {
  id: string;
  onNavigate: () => void;
}

// Abaixo de md a navegação horizontal não cabe; o painel abre pelo botão de
// menu do header.
export function MobileNavigation({ id, items, activePath, onNavigate }: MobileNavigationProps) {
  return (
    <nav id={id} aria-label="Principal" className="md:hidden border-t border-outline-variant bg-white">
      <ul className="container mx-auto px-8 py-2">
        {items.map(({ label, path }) => {
          const ativo = path === activePath;
          return (
            <li key={label}>
              <Link
                to={path}
                onClick={onNavigate}
                aria-current={ativo ? 'page' : undefined}
                className={cn(
                  'block py-3 text-[15px] hover:opacity-100',
                  ativo ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
