import { useId, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BlocoProps {
  titulo: string;
  descricao?: string;
  className?: string;
  children: ReactNode;
}

export function Bloco({ titulo, descricao, className, children }: BlocoProps) {
  const id = useId();
  return (
    <Card
      role="region"
      aria-labelledby={id}
      className={cn('break-inside-avoid rounded-md border-outline-variant shadow-none', className)}
    >
      <CardHeader>
        <CardTitle>
          <h2 id={id} className="text-[15px] font-bold tracking-normal text-primary">{titulo}</h2>
        </CardTitle>
        {descricao && <CardDescription className="text-[13px] text-on-surface-variant">{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
