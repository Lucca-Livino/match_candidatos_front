import { useState, useEffect, useCallback } from 'react';
import { getVagas } from '../api';
import type { Vaga } from '../types';

export function useVagas() {
  const [vagas, setVagas]     = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchVagas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVagas();
      setVagas(data);
    } catch {
      setError('Falha ao carregar vagas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVagas(); }, [fetchVagas]);

  return { vagas, loading, error, refetch: fetchVagas };
}
