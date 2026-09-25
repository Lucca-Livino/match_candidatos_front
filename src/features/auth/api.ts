import { request } from '@/lib/api';
import type { AuthUser } from './types';

export async function getMe(): Promise<AuthUser> {
  const data = await request<{ success: boolean; data: AuthUser }>('/api/me');
  return data.data;
}
