import { useCallback, useEffect, useState } from 'react';

const mensagemDe = (err: unknown) => (err instanceof Error ? err.message : 'Falha ao carregar.');

export function useCrud<T>(
  userId: string | undefined,
  listFn: (userId: string) => Promise<T[]>,
) {
  const [items, setItems]               = useState<T[]>([]);
  const [error, setError]               = useState<string | null>(null);
  const [recarregando, setRecarregando] = useState(false);
  const [carregadoPara, setCarregadoPara] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    listFn(userId)
      .then(lista => { if (ativo) { setItems(lista); setError(null); } })
      .catch(err => { if (ativo) setError(mensagemDe(err)); })
      .finally(() => { if (ativo) setCarregadoPara(userId); });
    return () => { ativo = false; };
    // listFn é estável (import de módulo); userId é a dependência real
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const reload = useCallback(async () => {
    if (!userId) return;
    setRecarregando(true);
    setError(null);
    try {
      setItems(await listFn(userId));
    } catch (err) {
      setError(mensagemDe(err));
    } finally {
      setRecarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loading = recarregando || carregadoPara !== userId;

  return { items, loading, error, reload };
}
