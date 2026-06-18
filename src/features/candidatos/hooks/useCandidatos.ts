import { useState, useEffect } from 'react';
import { getCandidatos } from '../api';
import type { Candidato } from '../types';

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    getCandidatos()
      .then(setCandidatos)
      .catch(() => setError('Falha ao carregar candidatos'))
      .finally(() => setLoading(false));
  }, []);

  return { candidatos, loading, error };
}
