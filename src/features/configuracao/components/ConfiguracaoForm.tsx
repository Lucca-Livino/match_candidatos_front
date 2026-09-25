import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getConfiguracao, patchConfiguracao } from '../api';
import { LIMITE_DEGRAUS, type ConfiguracaoIntegracao, type Provedor } from '../types';

const PROVEDORES: { valor: Provedor; rotulo: string }[] = [
  { valor: 'gemini', rotulo: 'Google Gemini' },
];

export function ConfiguracaoForm() {
  const [config, setConfig] = useState<ConfiguracaoIntegracao | null>(null);
  const [limiar, setLimiar] = useState(0.7);
  const [provedor, setProvedor] = useState<Provedor>('gemini');
  const [cascata, setCascata] = useState<string[]>([]);
  const [temperatura, setTemperatura] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function preencher(c: ConfiguracaoIntegracao) {
    setConfig(c);
    setLimiar(c.limiteCompatibilidade);
    setProvedor(c.provedor);
    setCascata(c.cascata);
    setTemperatura(c.temperatura);
    setAtivo(c.ativo);
  }

  useEffect(() => {
    getConfiguracao()
      .then(preencher)
      .catch(() => setErro('Falha ao carregar a configuração.'));
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      // Degraus em branco são descartados aqui e também no validator da API.
      // Duplicação proposital: o front evita um 400 previsível, o servidor
      // protege quem escreve por outro caminho.
      const degraus = cascata.map((m) => m.trim()).filter(Boolean);
      const atualizada = await patchConfiguracao({
        limiteCompatibilidade: limiar,
        provedor,
        cascata: degraus,
        temperatura,
        ativo,
      });
      preencher(atualizada);
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  if (!config) {
    return <p className="text-[14px] text-on-surface-variant">{erro ?? 'Carregando…'}</p>;
  }

  return (
    <form onSubmit={salvar} className="space-y-8">
      {erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-[13px]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {erro}
        </div>
      )}

      {/* Triagem */}
      <div className="bg-white border border-outline-variant rounded-md p-6 space-y-5">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
          Triagem
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="limiar" className="text-[13px] font-semibold">
            Limiar de compatibilidade: {(limiar * 100).toFixed(0)}%
          </Label>
          <input
            id="limiar"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={limiar}
            onChange={(e) => setLimiar(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-[12px] text-on-surface-variant">
            Candidaturas com compatibilidade igual ou superior são marcadas como compatíveis.
            Alterar o limiar não reavalia candidaturas já processadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="ativo"
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <Label htmlFor="ativo" className="text-[13px] font-semibold">
            Triagem automática ativa
          </Label>
        </div>
      </div>

      {/* Provedor e modelos */}
      <div className="bg-white border border-outline-variant rounded-md p-6 space-y-5">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
          Provedor e modelos
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="provedor" className="text-[13px] font-semibold">
            Provedor de IA
          </Label>
          <Select value={provedor} onValueChange={(v) => setProvedor(v as Provedor)}>
            <SelectTrigger id="provedor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES.map((p) => (
                <SelectItem
                  key={p.valor}
                  value={p.valor}
                  disabled={!config.chavesConfiguradas[p.valor]}
                >
                  {p.rotulo}
                  {config.chavesConfiguradas[p.valor] ? '' : ' — chave ausente'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-[13px] font-semibold">Cascata de modelos</legend>
          <p className="text-[12px] text-on-surface-variant">
            A avaliação usa o primeiro modelo da lista. Quando a cota diária dele se esgota, a
            próxima candidatura passa para o modelo seguinte. A ordem importa: coloque o modelo
            mais barato no topo e a reserva embaixo.
          </p>

          {cascata.map((modelo, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[12px] text-on-surface-variant">
                {i === 0 ? 'principal' : `reserva ${i}`}
              </span>
              <Input
                value={modelo}
                onChange={(e) => setCascata(cascata.map((m, j) => (j === i ? e.target.value : m)))}
                placeholder="ex.: gemini-3.1-flash-lite"
                aria-label={`Modelo do degrau ${i + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const nova = [...cascata];
                  [nova[i - 1], nova[i]] = [nova[i], nova[i - 1]];
                  setCascata(nova);
                }}
                disabled={i === 0}
                aria-label={`Subir o degrau ${i + 1}`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCascata(cascata.filter((_, j) => j !== i))}
                // Cascata vazia não teria a quem perguntar: o último degrau não
                // pode ser removido pela tela.
                disabled={cascata.length <= 1}
                aria-label={`Remover o degrau ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => setCascata([...cascata, ''])}
            disabled={cascata.length >= LIMITE_DEGRAUS}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar degrau
          </Button>

          <p className="text-[12px] text-on-surface-variant">
            Modelo repetido é recusado: se a cota de um modelo acabou, ela acabou nas duas
            posições, e a segunda não seria reserva nenhuma. Máximo de {LIMITE_DEGRAUS} degraus.
          </p>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="temperatura" className="text-[13px] font-semibold">
            Temperatura: {temperatura.toFixed(2)}
          </Label>
          <input
            id="temperatura"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={temperatura}
            onChange={(e) => setTemperatura(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-[12px] text-on-surface-variant">
            0 produz o resultado mais reproduzível. Valores altos aumentam a variação entre
            avaliações do mesmo candidato.
          </p>
        </div>
      </div>

      {/* Chaves e estado salvo */}
      <div className="bg-white border border-outline-variant rounded-md p-6 space-y-3">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
          Chaves de API
        </h2>
        <ul className="space-y-1 text-[13px]">
          {PROVEDORES.map((p) => (
            <li key={p.valor}>
              {p.rotulo}:{' '}
              <span
                className={config.chavesConfiguradas[p.valor] ? 'text-emerald-600' : 'text-red-700'}
              >
                {config.chavesConfiguradas[p.valor] ? 'configurada' : 'não configurada'}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-on-surface-variant">
          Definidas por variável de ambiente no servidor. Os valores não são exibidos nem editáveis
          aqui.
        </p>

        <div className="pt-2 text-[13px] text-on-surface-variant">
          Cascata salva:{' '}
          {config.cascata.map((m, i) => (
            <span key={m}>
              {i > 0 && ' → '}
              <code>{m}</code>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
        {salvo && <span className="text-[13px] text-emerald-600">Configuração salva.</span>}
      </div>
    </form>
  );
}
