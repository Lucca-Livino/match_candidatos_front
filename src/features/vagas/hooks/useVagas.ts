import { useState, useEffect, useCallback } from 'react';
import { getVagas } from '../api';
import type { Vaga } from '../types';

export function useVagas() {
  const [vagas, setVagas]     = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Só grava estado quando a resposta chega: o efeito da carga inicial não
  // pode chamar setState síncrono (o `loading` já nasce true).
  const carregar = useCallback(
    () =>
      getVagas()
        .then(data => { setVagas(data); setError(null); })
        .catch(() => setError('Falha ao carregar vagas'))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => { carregar(); }, [carregar]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return carregar();
  }, [carregar]);

  return { vagas, loading, error, refetch };
}
