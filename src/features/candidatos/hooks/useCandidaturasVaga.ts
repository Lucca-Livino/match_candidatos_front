import { useState, useEffect, useCallback } from 'react';
import { getCandidaturasDaVaga, atualizarStatusCandidatura } from '../api';
import type { CandidaturaVaga } from '../types';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';
import type { StatusCandidatura } from '@/features/candidato/api';

export function useCandidaturasVaga(vagaId: string | undefined) {
  const [vaga, setVaga]                 = useState<Vaga | null>(null);
  const [candidaturas, setCandidaturas] = useState<CandidaturaVaga[]>([]);
  const [error, setError]               = useState<string | null>(null);
  const [movendoId, setMovendoId]       = useState<string | null>(null);
  const [versao, setVersao]             = useState(0);
  // Vaga e versão da última carga concluída. `loading` é derivado dela, então
  // o efeito só grava estado quando a resposta chega.
  const [carregado, setCarregado]       = useState<{ vagaId: string; versao: number } | null>(null);

  useEffect(() => {
    if (!vagaId) return;
    let ativo = true;
    Promise.all([getVaga(vagaId), getCandidaturasDaVaga(vagaId)])
      .then(([v, cands]) => {
        if (!ativo) return;
        setVaga(v);
        setCandidaturas(cands);
        setError(null);
      })
      .catch(() => { if (ativo) setError('Falha ao carregar candidatos da vaga.'); })
      .finally(() => { if (ativo) setCarregado({ vagaId, versao }); });
    return () => { ativo = false; };
  }, [vagaId, versao]);

  const loading = Boolean(vagaId) && (carregado?.vagaId !== vagaId || carregado?.versao !== versao);

  const carregar = useCallback(() => {
    setError(null);
    setVersao(v => v + 1);
  }, []);

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

  return { vaga, setVaga, candidaturas, loading, error, movendoId, moverStatus, recarregar: carregar };
}
