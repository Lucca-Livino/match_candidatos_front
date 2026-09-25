import { useCallback, useEffect, useState } from 'react';

export function useCrud<T>(
  userId: string | undefined,
  listFn: (userId: string) => Promise<T[]>,
) {
  const [items, setItems]     = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await listFn(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar.');
    } finally {
      setLoading(false);
    }
    // listFn é estável (import de módulo); userId é a dependência real
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload };
}
