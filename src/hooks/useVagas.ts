import { useEffect, useState } from 'react';
import { getVagas, type Vaga } from '@/lib/api';

interface UseVagasReturn {
  vagas: Vaga[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVagas(): UseVagasReturn {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getVagas()
      .then(setVagas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { vagas, loading, error, refetch };
}
