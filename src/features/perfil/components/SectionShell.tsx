import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SectionShellProps {
  title: string;
  icon: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  children?: ReactNode;
}

export function SectionShell({
  title, icon, onAdd, addLabel = 'Adicionar',
  loading, error, empty, emptyText = 'Nenhum registro ainda.', children,
}: SectionShellProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-primary">
          <span className="text-secondary">{icon}</span>
          {title}
        </h2>
        {onAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="rounded-xl gap-1.5 text-[13px]"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-red-600 py-4">{error}</p>
      ) : empty ? (
        <p className="text-[13px] text-on-surface-variant py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}
