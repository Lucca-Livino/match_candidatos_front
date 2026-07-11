import type { Questionario, RespostaLocal } from '../types';

interface QuestionarioResponderProps {
  questionario: Questionario;
  respostas: Record<string, RespostaLocal>;
  onChange: (perguntaId: string, next: RespostaLocal) => void;
  disabled?: boolean;
}

const VAZIA: RespostaLocal = { opcaoId: '', texto: '' };

export function QuestionarioResponder({
  questionario,
  respostas,
  onChange,
  disabled,
}: QuestionarioResponderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-primary">{questionario.titulo}</h2>
        {questionario.instrucoes && (
          <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed whitespace-pre-line">
            {questionario.instrucoes}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {questionario.perguntas.map((p, idx) => {
          const r = respostas[p.id] ?? VAZIA;
          return (
            <div key={p.id} className="space-y-3">
              <p className="text-[14px] font-medium text-primary">
                {idx + 1}. {p.enunciado}
                {p.obrigatoria === 1 && <span className="text-red-500 ml-1">*</span>}
              </p>

              {p.tipoResposta === 'dissertativa' ? (
                <textarea
                  value={r.texto}
                  onChange={(e) => onChange(p.id, { ...r, texto: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  maxLength={5000}
                  placeholder="Digite sua resposta..."
                  className="flex w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 resize-y"
                />
              ) : (
                <div className="space-y-2">
                  {p.opcaoResposta.map((o) => (
                    <label
                      key={o.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-[#f8f9fc] transition-colors has-[:checked]:border-secondary has-[:checked]:bg-[#f8f9fc]"
                    >
                      <input
                        type="radio"
                        name={`pergunta-${p.id}`}
                        checked={r.opcaoId === o.id}
                        onChange={() => onChange(p.id, { ...r, opcaoId: o.id })}
                        disabled={disabled}
                        className="h-4 w-4 accent-secondary flex-shrink-0"
                      />
                      <span className="text-[14px] text-primary">{o.texto}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
