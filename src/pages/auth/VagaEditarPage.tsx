import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { VagaForm } from '@/features/vagas/components/VagaForm';
import { getVaga } from '@/features/vagas/api';
import type { Vaga } from '@/features/vagas/types';

export default function VagaEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vaga, setVaga]       = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) { navigate('/vagas'); return; }
    getVaga(id)
      .then(setVaga)
      .catch(err => setError(err instanceof Error ? err.message : 'Vaga não encontrada.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-8 max-w-[900px] py-16 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !vaga) {
    return (
      <div className="container mx-auto px-8 max-w-[900px] py-16 text-center text-red-600">
        {error ?? 'Vaga não encontrada.'}
      </div>
    );
  }

  return (
    <VagaForm
      mode="editar"
      vagaId={vaga.id}
      initial={{
        titulo:           vaga.titulo,
        area:             vaga.area ?? '',
        descricao:        vaga.descricao ?? '',
        requisitos_gerais: vaga.requisitos_gerais ?? '',
        status:           vaga.status ?? 'ativa',
        criterio_vaga:    vaga.criterio_vaga ?? [],
      }}
    />
  );
}
