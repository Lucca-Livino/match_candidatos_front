import { useState, useEffect, useCallback } from 'react';
import { getCandidaturasDaVaga, atualizarStatusCandidatura } from '../api';
import type { CandidaturaVaga } from '../types';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';
import type { StatusCandidatura } from '@/features/candidato/api';

export function useCandidaturasVaga(vagaId: string | undefined) {
  const [vaga, setVaga]                 = useState<Vaga | null>(null);
  const [candidaturas, setCandidaturas] = useState<CandidaturaVaga[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [movendoId, setMovendoId]       = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!vagaId) return;
    setLoading(true);
    setError(null);
    try {
      const [v, cands] = await Promise.all([getVaga(vagaId), getCandidaturasDaVaga(vagaId)]);
      setVaga(v);
      setCandidaturas(cands);
    } catch {
      setError('Falha ao carregar candidatos da vaga.');
    } finally {
      setLoading(false);
    }
  }, [vagaId]);

  useEffect(() => { carregar(); }, [carregar]);

  const moverStatus = useCallback(
    async (candidatura: CandidaturaVaga, novoStatus: StatusCandidatura) => {
      if (!vagaId) return;
      setMovendoId(candidatura.id);
      setError(null);
      try {
        const atualizada = await atualizarStatusCandidatura(
          candidatura.usuarioId,
          vagaId,
          novoStatus,
        );
        setCandidaturas(prev =>
          prev.map(c => (c.id === candidatura.id ? { ...c, ...atualizada, candidato: c.candidato } : c)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao mover candidato.');
      } finally {
        setMovendoId(null);
      }
    },
    [vagaId],
  );

  return { vaga, candidaturas, loading, error, movendoId, moverStatus, recarregar: carregar };
}
