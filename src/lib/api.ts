const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';

/** Erro de API que preserva o status HTTP, para o chamador decidir o que tolerar. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  if (res.status === 401) {
    // Determina o login correto pelo papel antes de limpar o cache.
    let loginPath = '/login';
    try {
      const cached = localStorage.getItem('auth_user');
      const papel = cached ? (JSON.parse(cached).tipos_permissao?.[0] as string | undefined) : undefined;
      if (papel === 'candidato') loginPath = '/candidato/login';
    } catch {
      /* cache inválido — usa login padrão */
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    if (_onUnauthorized) {
      _onUnauthorized();
    } else {
      window.location.replace(loginPath);
    }
    throw new ApiError('Não autorizado', 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError((body as { message?: string })?.message ?? `Erro ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}
