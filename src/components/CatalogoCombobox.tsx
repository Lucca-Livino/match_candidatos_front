import { useEffect, useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { buscarCatalogo, type ItemCatalogo, type TipoCatalogo } from '@/features/catalogo';

interface Props {
  tipo: TipoCatalogo;
  texto: string;
  itemId: string | null;
  onChange: (valor: { texto: string; itemId: string | null }) => void;
  placeholder?: string;
  required?: boolean;
  avisoForaDoCatalogo?: boolean;
  id?: string;
  maxLength?: number;
}

export function CatalogoCombobox({ tipo, texto, itemId, onChange, placeholder, required, avisoForaDoCatalogo, id, maxLength = 120 }: Props) {
  const listaId = useId();
  const [sugestoes, setSugestoes] = useState<ItemCatalogo[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const pedido = useRef(0);
  // Lista exibida quando a resposta chega: o updater de setAtivo roda antes do
  // novo render, entao `sugestoes` do closure estaria velho.
  const sugestoesRef = useRef(sugestoes);
  useEffect(() => { sugestoesRef.current = sugestoes; }, [sugestoes]);

  useEffect(() => {
    if (!aberto) return;
    const numero = ++pedido.current;
    const t = setTimeout(async () => {
      try {
        const itens = await buscarCatalogo(tipo, texto);
        if (numero !== pedido.current) return;
        // Quem apertou ↓ antes da busca responder nao perde a escolha: zerar
        // aqui fazia o Enter seguinte enviar o formulario com texto livre.
        setAtivo((a) => {
          const id = sugestoesRef.current[a]?.id;
          return id ? itens.findIndex((s) => s.id === id) : -1;
        });
        setSugestoes(itens);
      } catch {
        if (numero === pedido.current) { setSugestoes([]); setAtivo(-1); }
      }
    }, 200);
    return () => clearTimeout(t);
  }, [tipo, texto, aberto]);

  const listaVisivel = aberto && sugestoes.length > 0;

  // O Radix Dialog escuta Esc no document em fase de captura; um listener em
  // window (captura) roda antes e fecha so a lista, sem fechar o dialogo.
  useEffect(() => {
    if (!listaVisivel) return;
    function fecharLista(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setAberto(false);
      setAtivo(-1);
    }
    window.addEventListener('keydown', fecharLista, true);
    return () => window.removeEventListener('keydown', fecharLista, true);
  }, [listaVisivel]);

  function escolher(item: ItemCatalogo) {
    onChange({ texto: item.nome, itemId: item.id });
    setAberto(false);
    setAtivo(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!listaVisivel) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo((a) => Math.min(a + 1, sugestoes.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && sugestoes[ativo]) { e.preventDefault(); escolher(sugestoes[ativo]); }
  }

  return (
    <div className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={aberto}
        aria-controls={listaVisivel ? listaId : undefined}
        aria-activedescendant={listaVisivel && sugestoes[ativo] ? `${listaId}-${ativo}` : undefined}
        aria-autocomplete="list"
        value={texto}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 120)}
        onKeyDown={onKeyDown}
        onChange={(e) => { onChange({ texto: e.target.value, itemId: null }); setAtivo(-1); setAberto(true); }}
      />
      {listaVisivel && (
        <ul id={listaId} role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover p-1 text-[13px] shadow-md">
          {sugestoes.map((s, i) => (
            <li key={s.id} id={`${listaId}-${i}`} role="option" aria-selected={i === ativo}
              onMouseDown={(e) => { e.preventDefault(); escolher(s); }}
              className={`cursor-pointer rounded px-2 py-1.5 ${i === ativo ? 'bg-accent' : 'hover:bg-accent'}`}>
              {s.nome}
              {/* Separador so para leitor de tela: sem ele o nome acessivel sai
                  colado ("JavaScriptJS, ECMAScript"). */}
              {s.sinonimos.length > 0 && <span className="sr-only">, também: </span>}
              {s.sinonimos.length > 0 && <span className="ml-2 text-[11px] opacity-60">{s.sinonimos.slice(0, 3).join(', ')}</span>}
            </li>
          ))}
        </ul>
      )}
      {avisoForaDoCatalogo && texto.trim() && !itemId && (
        <p className="mt-1 text-[11px] text-on-surface-variant">
          Fora do catálogo: vale para a análise, mas não comprova requisito obrigatório.
        </p>
      )}
    </div>
  );
}
