import type { ReactNode } from 'react';
import { Mail, Phone, MapPin, Link } from 'lucide-react';
import { GRAU_LABEL, NIVEL_LABEL } from '@/features/perfil/constants';
import { STATUS_CANDIDATURA_CONFIG } from '@/features/candidato/constants';
import { formatarData, formatarDataCompleta, formatarPeriodo } from '../format';
import type { FichaCandidatura } from '../types';

export function FichaCandidato({ ficha }: { ficha: FichaCandidatura }) {
  const { candidato, vaga, candidatura, curriculo, questionario } = ficha;

  return (
    <article className="mx-auto max-w-[210mm] bg-white p-10 text-[13px] text-neutral-900 shadow-sm print:max-w-none print:p-0 print:shadow-none">
      <header className="border-b border-neutral-300 pb-5">
        <h1 className="text-[22px] font-bold">{candidato.nome}</h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-neutral-700">
          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{candidato.email}</span>
          {candidato.telefone && (
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{candidato.telefone}</span>
          )}
          {candidato.cidade && (
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{candidato.cidade}</span>
          )}
          {candidato.linkedin && (
            <span className="flex items-center gap-1.5"><Link className="h-3.5 w-3.5" />{candidato.linkedin}</span>
          )}
        </div>
        <p className="mt-3 text-neutral-700">
          <span className="font-semibold">Vaga:</span> {vaga.titulo} ({vaga.area})
          {' · '}
          <span className="font-semibold">Status:</span> {STATUS_CANDIDATURA_CONFIG[candidatura.status]?.label ?? candidatura.status}
          {candidatura.criadoEm && <> · <span className="font-semibold">Inscrição:</span> {formatarDataCompleta(candidatura.criadoEm)}</>}
        </p>
      </header>

      <Secao titulo="Habilidades" vazio={curriculo.habilidades.length === 0}>
        <p>
          {curriculo.habilidades.map((h) => `${h.habilidade} (${NIVEL_LABEL[h.nivel] ?? h.nivel})`).join(' · ')}
        </p>
      </Secao>

      <Secao titulo="Experiência" vazio={curriculo.experiencias.length === 0}>
        {curriculo.experiencias.map((e) => (
          <div key={e.id} className="mb-3 break-inside-avoid">
            <p className="font-semibold">{e.cargo} — {e.empresa}</p>
            <p className="text-neutral-600">{formatarPeriodo(e.dataInicio, e.dataFim)}</p>
            {e.descricaoAtivida_ && <p className="mt-1 whitespace-pre-line">{e.descricaoAtivida_}</p>}
          </div>
        ))}
      </Secao>

      <Secao titulo="Formação" vazio={curriculo.formacoes.length === 0}>
        {curriculo.formacoes.map((f) => (
          <div key={f.id} className="mb-3 break-inside-avoid">
            <p className="font-semibold">{f.curso} — {f.instituicao}</p>
            <p className="text-neutral-600">
              {GRAU_LABEL[f.grau] ?? f.grau} · {f.anoInicio}{f.anoConclusao ? ` – ${f.anoConclusao}` : ' – Em andamento'}{f.situacao ? ` · ${f.situacao}` : ''}
            </p>
          </div>
        ))}
      </Secao>

      <Secao titulo="Certificações" vazio={curriculo.certificacoes.length === 0}>
        {curriculo.certificacoes.map((c) => (
          <div key={c.id} className="mb-3 break-inside-avoid">
            <p className="font-semibold">{c.nome} — {c.emissor}</p>
            {(c.dataEmissao || c.codigo) && (
              <p className="text-neutral-600">
                {formatarData(c.dataEmissao)}
                {c.codigo ? ` · ${c.codigo}` : ''}
              </p>
            )}
          </div>
        ))}
      </Secao>

      <Secao
        titulo={questionario.titulo ? `Questionário — ${questionario.titulo}` : 'Questionário'}
        vazio={questionario.respostas.length === 0}
        textoVazio="Sem respostas de questionário para esta vaga."
      >
        <ol className="list-decimal space-y-3 pl-5">
          {questionario.respostas.map((r) => (
            <li key={r.perguntaId} className="break-inside-avoid">
              <p className="font-semibold">{r.enunciado}</p>
              <p className="mt-0.5 whitespace-pre-line">
                {r.tipoResposta === 'dissertativa'
                  ? r.textoResposta || '—'
                  : r.opcoesSelecionadas.join(', ') || '—'}
              </p>
            </li>
          ))}
        </ol>
      </Secao>
    </article>
  );
}

interface SecaoProps {
  titulo: string;
  vazio: boolean;
  textoVazio?: string;
  children: ReactNode;
}

function Secao({ titulo, vazio, textoVazio = 'Nada informado.', children }: SecaoProps) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-neutral-200 pb-1 text-[14px] font-bold uppercase tracking-wide text-neutral-800 break-after-avoid">
        {titulo}
      </h2>
      {vazio ? <p className="italic text-neutral-500">{textoVazio}</p> : children}
    </section>
  );
}
