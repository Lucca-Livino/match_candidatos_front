import { request } from '@/lib/api';
import type { DadosConvite, FiltrosUsuarios, PaginaUsuarios, UsuarioInterno } from './types';

interface Envelope<T> {
  data: T;
}

const POR_PAGINA = 10;

/** Sem filtro de papel, a tela lista os dois papéis convidáveis juntos. */
export async function listarUsuariosInternos(filtros: FiltrosUsuarios = {}): Promise<PaginaUsuarios> {
  const params = new URLSearchParams({
    page: String(filtros.page ?? 1),
    limit: String(POR_PAGINA),
    papel: filtros.papel ?? 'recrutador,suporte',
  });
  if (filtros.situacao) params.set('situacao', filtros.situacao);

  const res = await request<Envelope<PaginaUsuarios>>(`/api/usuarios?${params.toString()}`);
  return res.data;
}

export async function convidarUsuario(dados: DadosConvite): Promise<UsuarioInterno> {
  const res = await request<Envelope<UsuarioInterno>>('/api/usuarios/convite', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return res.data;
}

export async function reenviarConvite(id: string): Promise<void> {
  await request(`/api/usuarios/${id}/reenviar-convite`, { method: 'POST' });
}

export async function alterarStatusUsuario(id: string, statusAtivo: boolean): Promise<void> {
  await request(`/api/usuarios/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_ativo: statusAtivo }),
  });
}

export async function excluirUsuario(id: string): Promise<void> {
  await request(`/api/usuarios/${id}`, { method: 'DELETE' });
}

/** Pública: a API responde 400 (nunca 401) a token ruim, então o cliente comum serve. */
export async function ativarConta(token: string, senha: string): Promise<void> {
  await request('/api/usuarios/ativar', {
    method: 'POST',
    body: JSON.stringify({ token, senha }),
  });
}
