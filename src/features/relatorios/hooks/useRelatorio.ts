import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

export interface ErroRelatorio {
  mensagem: string;
  /** Status HTTP quando a falha veio da API (404 = vaga não encontrada). */
  status: number | null;
}

const montarErro = (e: unknown): ErroRelatorio => ({
  mensagem: e instanceof ApiError && e.status === 404
    ? e.message
    : 'Não foi possível gerar o relatório. Verifique a conexão e tente novamente.',
  status: e instanceof ApiError ? e.status : null,
});

interface Resposta<T> {
  buscar: () => Promise<T>;
  versao: number;
  erro: ErroRelatorio | null;
}

/** `buscar` precisa ser estável (useCallback): ele define quando recarregar. */
export function useRelatorio<T>(buscar: () => Promise<T>) {
  const [dados, setDados]       = useState<T | null>(null);
  const [versao, setVersao]     = useState(0);
  const [resposta, setResposta] = useState<Resposta<T> | null>(null);

  useEffect(() => {
    let ativo = true;
    buscar()
      .then(d => {
        if (!ativo) return;
        setDados(d);
        setResposta({ buscar, versao, erro: null });
      })
      .catch((e: unknown) => {
        if (ativo) setResposta({ buscar, versao, erro: montarErro(e) });
      });
    return () => { ativo = false; };
  }, [buscar, versao]);

  const atual = resposta?.buscar === buscar && resposta.versao === versao;
  const recarregar = useCallback(() => setVersao(v => v + 1), []);

  return {
    dados,
    loading: !atual,
    erro: atual ? resposta.erro : null,
    recarregar,
  };
}
