// Com o proxy do Vite, todas as chamadas /api são encaminhadas para http://localhost:5000
// isso elimina CORS e faz cookies de sessão funcionarem automaticamente.
// VITE_API_BASE_URL deve ficar vazio em desenvolvimento.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';

// ─── Utilitário de logout ─────────────────────────────────────────────────────
// Callback registrado pelo App para fazer logout sem recarregar a página
let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // envia cookies de sessão (better-auth)
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  if (res.status === 401) {
    // Limpa estado local e notifica o App para voltar ao Login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    _onUnauthorized?.();
    throw new Error('Não autorizado');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message ?? `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function getMe(): Promise<AuthUser> {
  // Rota customizada montada em /api/me (authRoutes.js → GET /me → app.use('/api', authRoutes))
  const data = await request<{ success: boolean; data: AuthUser }>('/api/me');
  return data.data;
}

// ─── Vagas ────────────────────────────────────────────────────────────────────

export interface Vaga {
  id: string;
  titulo: string;
  descricao?: string;
  localizacao?: string;
  salario?: number;
  status?: string;
  criadoEm?: string;
}

// Resposta paginada da API: { success, data: { docs: [], total, page, limit } }
interface PaginatedResponse<T> {
  docs: T[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getVagas(): Promise<Vaga[]> {
  const res = await request<ApiResponse<PaginatedResponse<Vaga>>>('/api/vagas');
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.docs)) return payload.docs;
  return [];
}

// ─── Candidatos ───────────────────────────────────────────────────────────────

export interface Candidato {
  id: string;
  nome?: string;
  name?: string;
  email?: string;
  telefone?: string;
  localizacao?: string;
  criadoEm?: string;
}

export async function getCandidatos(): Promise<Candidato[]> {
  const res = await request<ApiResponse<PaginatedResponse<Candidato>>>('/api/candidato');
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.docs)) return payload.docs;
  return [];
}
