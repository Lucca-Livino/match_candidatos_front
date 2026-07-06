import { useState, useEffect } from 'react';
import { getCandidatos } from '../api';
import type { Candidato } from '../types';

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    getCandidatos()
      .then(({ docs, totalDocs }) => {
        setCandidatos(docs);
        setTotal(totalDocs);
      })
      .catch(() => setError('Falha ao carregar candidatos'))
      .finally(() => setLoading(false));
  }, []);

  return { candidatos, total, loading, error };
}
