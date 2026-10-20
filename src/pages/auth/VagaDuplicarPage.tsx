import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VagaForm } from '@/features/vagas/components/VagaForm';
import { getVaga } from '@/features/vagas/api';
import { prepararVagaCopia, prepararQuestionarioCopia } from '@/features/vagas/duplicar';
import type { Vaga } from '@/features/vagas/types';
import { carregarQuestionarioDaVaga, type QuestionarioForm } from '@/features/questionarios';
import { NAV_ITEMS } from '@/lib/nav';

export default function VagaDuplicarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vaga, setVaga]                 = useState<Vaga | null>(null);
  const [questionario, setQuestionario] = useState<QuestionarioForm | null>(null);
  const [falhaQuestionario, setFalhaQuestionario] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!id) { navigate('/vagas'); return; }
    Promise.all([
      getVaga(id),
      // Sem o questionário a cópia ainda serve: o recrutador monta outro.
      carregarQuestionarioDaVaga(id).catch(() => { setFalhaQuestionario(true); return null; }),
    ])
      .then(([v, q]) => { setVaga(v); setQuestionario(q); })
      .catch(err => setError(err instanceof Error ? err.message : 'Vaga não encontrada.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <Header navItems={NAV_ITEMS} />
        <main className="flex-grow container mx-auto px-8 max-w-[900px] py-16 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !vaga) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <Header navItems={NAV_ITEMS} />
        <main className="flex-grow container mx-auto px-8 max-w-[900px] py-16 text-center text-red-600">
          {error ?? 'Vaga não encontrada.'}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <VagaForm
      mode="criar"
      origem="duplicar"
      initial={prepararVagaCopia(vaga)}
      initialQuestionario={questionario ? prepararQuestionarioCopia(questionario) : undefined}
      aviso={falhaQuestionario
        ? 'Não foi possível copiar o questionário da vaga original. Monte um novo antes de salvar.'
        : undefined}
    />
  );
}
