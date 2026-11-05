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
  const [carga, setCarga] = useState<{
    usuarioId: string;
    detalhe: CandidatoDetalhe;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    Promise.all([
      listFormacoes(usuarioId),
      listExperiencias(usuarioId),
      listHabilidades(usuarioId),
      listCertificacoes(usuarioId),
    ])
      .then(([formacoes, experiencias, habilidades, certificacoes]) => {
        if (ativo) setCarga({ usuarioId, detalhe: { formacoes, experiencias, habilidades, certificacoes }, error: null });
      })
      .catch(() => {
        if (ativo) setCarga({ usuarioId, detalhe: VAZIO, error: 'Falha ao carregar dados do candidato.' });
      });

    return () => { ativo = false; };
  }, [usuarioId]);

  const atual = usuarioId && carga?.usuarioId === usuarioId ? carga : null;
  const loading = Boolean(usuarioId) && atual === null;

  return { ...(atual?.detalhe ?? VAZIO), loading, error: atual?.error ?? null };
}
