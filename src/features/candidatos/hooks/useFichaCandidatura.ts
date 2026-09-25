import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getFichaCandidatura } from '../api';
import type { FichaCandidatura } from '../types';

interface ErroFicha {
  status: number | null;
  message: string;
}

const SEM_PARAMETROS: ErroFicha = { status: 404, message: 'Candidatura não encontrada.' };

// A ficha abre em aba própria, com vaga e candidato fixos na URL: não há troca
// de parâmetros durante a vida da página, então o estado não precisa ser
// reiniciado no efeito (e nenhum setState roda de forma síncrona nele).
export function useFichaCandidatura(vagaId: string | undefined, usuarioId: string | undefined) {
  const [ficha, setFicha]     = useState<FichaCandidatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<ErroFicha | null>(null);
  const semParametros = !vagaId || !usuarioId;

  useEffect(() => {
    if (!vagaId || !usuarioId) return;
    let ativo = true;
    getFichaCandidatura(vagaId, usuarioId)
      .then((data) => ativo && setFicha(data))
      .catch((err) => {
        if (!ativo) return;
        setError({
          status: err instanceof ApiError ? err.status : null,
          message: err instanceof Error ? err.message : 'Falha ao carregar a ficha.',
        });
      })
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [vagaId, usuarioId]);

  if (semParametros) return { ficha: null, loading: false, error: SEM_PARAMETROS };
  return { ficha, loading, error };
}
