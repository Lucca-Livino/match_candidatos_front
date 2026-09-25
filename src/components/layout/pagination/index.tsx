import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-on-surface-variant text-[13px]">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(p as number)}
            className="h-9 w-9 text-[13px] font-medium"
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
