import { useState, useEffect } from 'react';
import {
  listFormacoes,
  listExperiencias,
  listHabilidades,
  listCertificacoes,
} from '@/features/perfil/api';
import type {
  Formacao,
  Experiencia,
  Habilidade,
  Certificacao,
} from '@/features/perfil/types';

interface CandidatoDetalhe {
  formacoes: Formacao[];
  experiencias: Experiencia[];
  habilidades: Habilidade[];
  certificacoes: Certificacao[];
}

const VAZIO: CandidatoDetalhe = {
  formacoes: [],
  experiencias: [],
  habilidades: [],
  certificacoes: [],
};

export function useCandidatoDetalhe(usuarioId: string | null) {
  const [detalhe, setDetalhe] = useState<CandidatoDetalhe>(VAZIO);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioId) {
      setDetalhe(VAZIO);
      return;
    }
    let ativo = true;
    setLoading(true);
    setError(null);
    Promise.all([
      listFormacoes(usuarioId),
      listExperiencias(usuarioId),
      listHabilidades(usuarioId),
      listCertificacoes(usuarioId),
    ])
      .then(([formacoes, experiencias, habilidades, certificacoes]) => {
        if (!ativo) return;
        setDetalhe({ formacoes, experiencias, habilidades, certificacoes });
      })
      .catch(() => ativo && setError('Falha ao carregar dados do candidato.'))
      .finally(() => ativo && setLoading(false));

    return () => { ativo = false; };
  }, [usuarioId]);

  return { ...detalhe, loading, error };
}
