// As datas do currículo chegam como meia-noite UTC. Formatar no fuso local
// (UTC-3) jogaria 01/03 para fevereiro, então tudo aqui formata em UTC.
function paraData(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarData(iso: string | null | undefined): string {
  const d = paraData(iso);
  return d ? d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
}

/** Data completa (dd/mm/aaaa) no fuso local — para instantes, como a data de inscrição. */
export function formatarDataCompleta(iso: string | null | undefined): string {
  const d = paraData(iso);
  return d ? d.toLocaleDateString('pt-BR') : '';
}

export function formatarPeriodo(inicio: string, fim: string | null): string {
  const ini = formatarData(inicio);
  const f = fim ? formatarData(fim) : 'Atual';
  return `${ini} – ${f}`;
}
