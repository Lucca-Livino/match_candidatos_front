import { cn } from '@/lib/utils';

interface IconeTriIAProps {
  tamanho?: number;
  escuro?: boolean;
  className?: string;
}

export function IconeTriIA({ tamanho = 32, escuro = false, className }: IconeTriIAProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('flex-shrink-0', className)}
    >
      <rect width="32" height="32" rx="7" fill={escuro ? 'rgba(255,255,255,0.08)' : '#001227'} />
      <path d="M16 7.5 L25 23 L7 23 Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="7.5" r="3.2" fill="#7fb6e0" />
      <circle cx="25" cy="23" r="3.2" fill="#fff" />
      <circle cx="7" cy="23" r="3.2" fill="#fff" />
    </svg>
  );
}

interface LogoTriIAProps {
  tamanho?: number;
  escuro?: boolean;
  className?: string;
  classeNome?: string;
}

export function LogoTriIA({ tamanho = 32, escuro = false, className, classeNome }: LogoTriIAProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <IconeTriIA tamanho={tamanho} escuro={escuro} />
      <span
        className={cn(
          'font-extrabold tracking-[-0.03em] leading-none',
          escuro ? 'text-white' : 'text-primary',
          classeNome,
        )}
        style={{ fontSize: Math.round(tamanho * 0.75) }}
      >
        Tri<span className={escuro ? 'text-[#9ccaf3]' : 'text-secondary'}>IA</span>
      </span>
    </span>
  );
}
