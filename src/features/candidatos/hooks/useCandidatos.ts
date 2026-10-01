import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCandidatos } from '../api';
import type { Candidato } from '../types';

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getCandidatos()
      .then(({ docs, totalDocs }) => {
        setCandidatos(docs);
        setTotal(totalDocs);
      })
      .catch(() => setError('Não foi possível carregar os candidatos. Verifique a conexão e tente novamente.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // /usuarios devolve todos os papeis; so quem tem papel de candidato conta.
  const somenteCandidatos = useMemo(
    () => candidatos.filter(c => (c.tipos_permissao ?? ['candidato']).includes('candidato')),
    [candidatos],
  );

  return { candidatos, somenteCandidatos, total, loading, error, recarregar: carregar };
}
