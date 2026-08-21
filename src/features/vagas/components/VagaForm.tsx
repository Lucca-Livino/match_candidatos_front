import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  QuestionarioSection,
  carregarQuestionarioDaVaga,
  salvarQuestionarioCompleto,
  validarQuestionario,
  emptyQuestionarioForm,
  type QuestionarioForm,
} from '@/features/questionarios';
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
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { Criterio, VagaPayload } from '../types';
import { AREAS, STATUSES } from '../constants';
import { createVaga, updateVaga } from '../api';
import { NAV_ITEMS } from '@/lib/nav';

const TIPOS_CRITERIO = [
  { value: 'skill_tecnica', label: 'Skill Técnica' },
  { value: 'formacao',      label: 'Formação'      },
  { value: 'experiencia',   label: 'Experiência'   },
  { value: 'certificacao',  label: 'Certificação'  },
] as const;

function emptyCriterio(): Criterio {
  return {
    nome: '',
    tipo_criterio: 'skill_tecnica',
    // Peso removido do UI por ora (voltará unificado). Backend exige 1..100 — default 1.
    peso_percentual: 1,
    obrigatorio: false,
    descricao: '',
  };
}

interface VagaFormProps {
  vagaId?: string;
  initial?: Partial<VagaPayload>;
  mode: 'criar' | 'editar';
}

export function VagaForm({ vagaId, initial, mode }: VagaFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [titulo, setTitulo]                   = useState(initial?.titulo ?? '');
  const [area, setArea]                       = useState(initial?.area ?? '');
  const [descricao, setDescricao]             = useState(initial?.descricao ?? '');
  const [requisitos, setRequisitos]           = useState(initial?.requisitos_gerais ?? '');
  const [status, setStatus]                   = useState(initial?.status ?? 'ativa');
  const [criterios, setCriterios]             = useState<Criterio[]>(initial?.criterio_vaga ?? []);

  // Questionário (obrigatório): `questionario` é o estado editável;
  // `originalQuestionario` é o snapshot do servidor, usado para reconciliar no save.
  const [questionario, setQuestionario]                 = useState<QuestionarioForm>(() => emptyQuestionarioForm());
  const [originalQuestionario, setOriginalQuestionario] = useState<QuestionarioForm | null>(null);

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Id da vaga já criada nesta sessão de formulário (modo criar) — evita
  // duplicar a vaga se o passo do questionário falhar e o usuário reenviar.
  const [vagaCriadaId, setVagaCriadaId] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'editar' || !vagaId) return;
    carregarQuestionarioDaVaga(vagaId)
      .then((form) => {
        // Questionário é obrigatório: se a vaga ainda não tem, começa um vazio.
        setQuestionario(form ?? emptyQuestionarioForm());
        setOriginalQuestionario(form ? structuredClone(form) : null);
      })
      .catch(() => { /* silencioso — vaga pode não ter questionário ainda */ });
  }, [mode, vagaId]);

  function addCriterio() {
    setCriterios(prev => [...prev, emptyCriterio()]);
  }

  function removeCriterio(idx: number) {
    setCriterios(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCriterio<K extends keyof Criterio>(idx: number, key: K, value: Criterio[K]) {
    setCriterios(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Questionário é obrigatório.
    const erroQuest = validarQuestionario(questionario);
    if (erroQuest) { setError(erroQuest); return; }
    if (!user?.name) { setError('Não foi possível identificar o usuário para criar o questionário.'); return; }

    const payload: VagaPayload = {
      titulo: titulo.trim(),
      area,
      descricao: descricao.trim(),
      requisitos_gerais: requisitos.trim(),
      criterio_vaga: criterios,
    };

    setSaving(true);
    setError(null);
    try {
      // 1. Vaga — cria ou atualiza; resolve o id para vincular o questionário.
      let idVaga: string;
      if (mode === 'editar') {
        await updateVaga(vagaId!, { ...payload, status });
        idVaga = vagaId!;
      } else if (vagaCriadaId) {
        // Reenvio após falha do questionário: reaproveita a vaga já criada,
        // ainda sem aplicar o status (o questionário pode falhar de novo).
        await updateVaga(vagaCriadaId, payload);
        idVaga = vagaCriadaId;
      } else {
        // A vaga nasce pausada no servidor. O status escolhido so e aplicado
        // depois que o questionario existe (passo 3).
        idVaga = (await createVaga(payload)).id;
        setVagaCriadaId(idVaga);
      }

      // 2. Questionário (obrigatório).
      // No modo criar, sincroniza com o que já existe no servidor (retentativa)
      // para reconciliar em vez de duplicar.
      let form = questionario;
      let original = originalQuestionario;
      if (mode === 'criar') {
        const existente = await carregarQuestionarioDaVaga(idVaga);
        if (existente) {
          form = { ...questionario, id: existente.id };
          original = existente;
        }
      }
      await salvarQuestionarioCompleto({
        vagaId: idVaga,
        criadoPor: user!.name,
        form,
        original,
      });

      // 3. Status escolhido — só agora, porque a API exige um questionário
      // ativo para ativar a vaga.
      if (mode === 'criar' && status !== 'pausada') {
        await updateVaga(idVaga, { status });
      }

      navigate('/vagas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar vaga.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="bg-[#1a2b45] text-white">
          <div className="container mx-auto px-8 max-w-[1400px] py-12">
            <h1 className="text-[36px] font-black tracking-tight mb-2">
              {mode === 'criar' ? 'Nova Vaga' : 'Editar Vaga'}
            </h1>
            <p className="text-[14px] text-white/70 max-w-[480px] leading-relaxed">
              {mode === 'criar'
                ? 'Preencha os dados para criar uma nova vaga no sistema.'
                : 'Atualize as informações da vaga abaixo.'}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-8 max-w-[900px] py-12">
          <form onSubmit={handleSubmit} className="space-y-8">

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-[13px]">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Dados principais */}
            <div className="bg-white border border-outline-variant rounded-md p-6 space-y-5">
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
                Dados da Vaga
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="titulo" className="text-[13px] font-semibold">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack Sênior"
                  required
                  minLength={3}
                  maxLength={180}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-[13px] font-semibold">Área *</Label>
                  <Select value={area} onValueChange={setArea} required>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-[13px] font-semibold">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mode === 'criar' && status === 'ativa' && (
                    <p className="text-[12px] text-on-surface-variant">
                      A vaga sera ativada apos o questionario ser salvo.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descricao" className="text-[13px] font-semibold">Descrição *</Label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva a vaga, responsabilidades e o que o candidato irá fazer..."
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
                <p className="text-[11px] text-on-surface-variant text-right">
                  {descricao.length}/3000
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="requisitos" className="text-[13px] font-semibold">Requisitos Gerais</Label>
                <textarea
                  id="requisitos"
                  value={requisitos}
                  onChange={e => setRequisitos(e.target.value)}
                  placeholder="Liste os requisitos gerais esperados para a vaga..."
                  maxLength={2000}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
                <p className="text-[11px] text-on-surface-variant text-right">
                  {requisitos.length}/2000
                </p>
              </div>
            </div>

            {/* Critérios de avaliação */}
            <div className="bg-white border border-outline-variant rounded-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Critérios de Avaliação
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-[12px] font-bold uppercase tracking-wider"
                  onClick={addCriterio}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Critério
                </Button>
              </div>

              {criterios.length === 0 && (
                <p className="text-[13px] text-on-surface-variant text-center py-6">
                  Nenhum critério adicionado. Critérios são opcionais.
                </p>
              )}

              <div className="space-y-4">
                {criterios.map((c, idx) => (
                  <div
                    key={idx}
                    className="border border-outline-variant rounded-md p-4 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeCriterio(idx)}
                      className="absolute top-3 right-3 text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Critério {idx + 1}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-semibold">Nome *</Label>
                        <Input
                          value={c.nome}
                          onChange={e => updateCriterio(idx, 'nome', e.target.value)}
                          placeholder="Ex: React, Node.js, Inglês..."
                          required
                          minLength={2}
                          maxLength={120}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-semibold">Tipo *</Label>
                        <Select
                          value={c.tipo_criterio}
                          onValueChange={v => updateCriterio(idx, 'tipo_criterio', v as Criterio['tipo_criterio'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_CRITERIO.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold">Obrigatório</Label>
                      <div className="flex items-center gap-2 h-9 px-3">
                        <input
                          type="checkbox"
                          id={`obrig-${idx}`}
                          checked={c.obrigatorio}
                          onChange={e => updateCriterio(idx, 'obrigatorio', e.target.checked)}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <label htmlFor={`obrig-${idx}`} className="text-[13px] text-on-surface-variant">
                          Sim, é obrigatório
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold">Descrição do critério</Label>
                      <Input
                        value={c.descricao ?? ''}
                        onChange={e => updateCriterio(idx, 'descricao', e.target.value)}
                        placeholder="Detalhe o que é esperado..."
                        maxLength={300}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questionário da vaga */}
            <QuestionarioSection value={questionario} onChange={setQuestionario} />

            {/* Ações */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vagas')}
                disabled={saving}
                className="text-[12px] font-bold uppercase tracking-wider"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !titulo.trim() || !area || !descricao.trim()}
                className="bg-[#1a2b45] text-white hover:bg-[#1a2b45]/90 text-[12px] font-bold uppercase tracking-wider px-8"
              >
                {saving
                  ? mode === 'criar' ? 'Criando...' : 'Salvando...'
                  : mode === 'criar' ? 'Criar Vaga' : 'Salvar Alterações'}
              </Button>
            </div>

          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
