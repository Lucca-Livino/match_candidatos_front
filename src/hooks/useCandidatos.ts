import { useEffect, useState } from 'react';
import { getCandidatos, type Candidato } from '@/lib/api';

interface UseCandidatosReturn {
  candidatos: Candidato[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCandidatos(): UseCandidatosReturn {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCandidatos()
      .then(setCandidatos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { candidatos, loading, error, refetch };
}
