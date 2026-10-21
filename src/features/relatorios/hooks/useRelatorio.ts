import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

export interface ErroRelatorio {
  mensagem: string;
  /** Status HTTP quando a falha veio da API (404 = vaga não encontrada). */
  status: number | null;
}

/** `buscar` precisa ser estável (useCallback): ele define quando recarregar. */
export function useRelatorio<T>(buscar: () => Promise<T>) {
  const [dados, setDados]     = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<ErroRelatorio | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    buscar()
      .then(d => setDados(d))
      .catch((e: unknown) =>
        setErro({
          mensagem: e instanceof ApiError && e.status === 404
            ? e.message
            : 'Não foi possível gerar o relatório. Verifique a conexão e tente novamente.',
          status: e instanceof ApiError ? e.status : null,
        }),
      )
      .finally(() => setLoading(false));
  }, [buscar]);

  useEffect(() => { carregar(); }, [carregar]);

  return { dados, loading, erro, recarregar: carregar };
}
