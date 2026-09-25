import { request } from '@/lib/api';
import type {
  Formacao, FormacaoPayload,
  Experiencia, ExperienciaPayload,
  Habilidade, HabilidadePayload,
  Certificacao, CertificacaoPayload,
  UsuarioPerfil, UsuarioUpdatePayload,
} from './types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}

// ---- Usuário ----
export async function getUsuario(id: string): Promise<UsuarioPerfil> {
  const res = await request<ApiResponse<UsuarioPerfil>>(`/api/usuarios/${id}`);
  return unwrap(res);
}

export async function updateUsuario(id: string, payload: UsuarioUpdatePayload): Promise<UsuarioPerfil> {
  const res = await request<ApiResponse<UsuarioPerfil>>(`/api/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

// ---- Formação ----
export async function listFormacoes(userId: string): Promise<Formacao[]> {
  const res = await request<ApiResponse<Formacao[]>>(`/api/usuarios/${userId}/formacao`);
  return unwrap(res) ?? [];
}

export async function createFormacao(userId: string, payload: FormacaoPayload): Promise<Formacao> {
  // O validator de criação trata anoConclusao AUSENTE como null; enviar null
  // explicitamente vira Number(null)=0 e é rejeitado. Por isso omitimos a chave.
  const body: Record<string, unknown> = { ...payload };
  if (body.anoConclusao === null) delete body.anoConclusao;

  const res = await request<ApiResponse<Formacao>>(`/api/usuarios/${userId}/formacao`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrap(res);
}

export async function updateFormacao(userId: string, id: string, payload: Partial<FormacaoPayload>): Promise<Formacao> {
  const res = await request<ApiResponse<Formacao>>(`/api/usuarios/${userId}/formacao/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function deleteFormacao(userId: string, id: string): Promise<void> {
  await request(`/api/usuarios/${userId}/formacao/${id}`, { method: 'DELETE' });
}

// ---- Experiência ----
export async function listExperiencias(userId: string): Promise<Experiencia[]> {
  const res = await request<ApiResponse<Experiencia[]>>(`/api/usuarios/${userId}/experiencia`);
  return unwrap(res) ?? [];
}

export async function createExperiencia(userId: string, payload: ExperienciaPayload): Promise<Experiencia> {
  const res = await request<ApiResponse<Experiencia>>(`/api/usuarios/${userId}/experiencia`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function updateExperiencia(userId: string, id: string, payload: Partial<ExperienciaPayload>): Promise<Experiencia> {
  const res = await request<ApiResponse<Experiencia>>(`/api/usuarios/${userId}/experiencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function deleteExperiencia(userId: string, id: string): Promise<void> {
  await request(`/api/usuarios/${userId}/experiencia/${id}`, { method: 'DELETE' });
}

// ---- Habilidade ----
export async function listHabilidades(userId: string): Promise<Habilidade[]> {
  const res = await request<ApiResponse<Habilidade[]>>(`/api/usuarios/${userId}/habilidade`);
  return unwrap(res) ?? [];
}

export async function createHabilidade(userId: string, payload: HabilidadePayload): Promise<Habilidade> {
  const res = await request<ApiResponse<Habilidade>>(`/api/usuarios/${userId}/habilidade`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function updateHabilidade(userId: string, id: string, payload: Partial<HabilidadePayload>): Promise<Habilidade> {
  const res = await request<ApiResponse<Habilidade>>(`/api/usuarios/${userId}/habilidade/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function deleteHabilidade(userId: string, id: string): Promise<void> {
  await request(`/api/usuarios/${userId}/habilidade/${id}`, { method: 'DELETE' });
}

// ---- Certificação ----
export async function listCertificacoes(userId: string): Promise<Certificacao[]> {
  const res = await request<ApiResponse<Certificacao[]>>(`/api/usuarios/${userId}/certificacao`);
  return unwrap(res) ?? [];
}

export async function createCertificacao(userId: string, payload: CertificacaoPayload): Promise<Certificacao> {
  const res = await request<ApiResponse<Certificacao>>(`/api/usuarios/${userId}/certificacao`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function updateCertificacao(userId: string, id: string, payload: Partial<CertificacaoPayload>): Promise<Certificacao> {
  const res = await request<ApiResponse<Certificacao>>(`/api/usuarios/${userId}/certificacao/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return unwrap(res);
}

export async function deleteCertificacao(userId: string, id: string): Promise<void> {
  await request(`/api/usuarios/${userId}/certificacao/${id}`, { method: 'DELETE' });
}
