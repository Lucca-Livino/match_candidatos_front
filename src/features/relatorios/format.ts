import type { Periodo, ResumoCandidaturas, Serie } from './types';

export const PERIODOS: { valor: Periodo; rotulo: string; descricao: string }[] = [
  { valor: '30d',  rotulo: '30 dias',  descricao: 'nos últimos 30 dias' },
  { valor: '90d',  rotulo: '90 dias',  descricao: 'nos últimos 90 dias' },
  { valor: '12m',  rotulo: '12 meses', descricao: 'nos últimos 12 meses' },
  { valor: 'tudo', rotulo: 'Tudo',     descricao: 'em todo o período' },
];

const periodoDe = (p: Periodo) => PERIODOS.find(x => x.valor === p) ?? PERIODOS[3];

export const descricaoPeriodo = (p: Periodo) => periodoDe(p).descricao;
export const rotuloPeriodo = (p: Periodo) => periodoDe(p).rotulo;
export const ehPeriodo = (v: string): v is Periodo => PERIODOS.some(p => p.valor === v);

export function formatarPercentual(valor: number | null): string {
  return valor === null ? '—' : `${Math.round(valor * 100)}%`;
}

export function detalheTaxa({ porStatus }: ResumoCandidaturas): string {
  const decididas = porStatus.aprovado + porStatus.reprovado;
  return decididas === 0
    ? 'Nenhuma candidatura decidida ainda'
    : `${porStatus.aprovado} de ${decididas} ${decididas === 1 ? 'decidida' : 'decididas'}`;
}

/** Rótulo do eixo: 14/09 (semana) ou set/26 (mês). Em UTC, como a API. */
export function rotuloPonto(inicio: string, granularidade: Serie['granularidade']): string {
  const data = new Date(`${inicio}T00:00:00Z`);
  return granularidade === 'semana'
    ? data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
    : `${data.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}/${inicio.slice(2, 4)}`;
}

export const formatarData = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');

export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
