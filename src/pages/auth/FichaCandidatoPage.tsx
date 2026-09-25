import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, papelDe, homeDoPapel } from '@/features/auth';
import { FichaCandidato, useFichaCandidatura } from '@/features/candidatos';

export default function FichaCandidatoPage() {
  const { vagaId, usuarioId } = useParams();
  const { user } = useAuth();
  const { ficha, loading, error } = useFichaCandidatura(vagaId, usuarioId);

  // O título vira o nome sugerido do arquivo em "Salvar como PDF".
  useEffect(() => {
    if (ficha) document.title = `Ficha - ${ficha.candidato.nome} - ${ficha.vaga.titulo}`;
  }, [ficha]);

  if (error?.status === 403) return <Navigate to={homeDoPapel(papelDe(user))} replace />;

  return (
    <div className="min-h-screen bg-neutral-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden">
        <Button onClick={() => window.print()} disabled={!ficha}>
          <Printer className="h-4 w-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      {loading && (
        <div className="mx-auto max-w-[210mm] space-y-3 bg-white p-10">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-[210mm] rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error.status === 404 ? 'Candidatura não encontrada.' : error.message}
        </div>
      )}

      {!loading && ficha && <FichaCandidato ficha={ficha} />}
    </div>
  );
}
