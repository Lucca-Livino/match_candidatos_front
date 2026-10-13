import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CatalogoCombobox } from '@/components/CatalogoCombobox';
import type { Criterio, Requisito } from '../types';

const NIVEIS = [['qualquer', 'Qualquer nível'], ['basico', 'Básico'], ['intermediario', 'Intermediário'], ['avancado', 'Avançado'], ['especialista', 'Especialista']] as const;
const GRAUS = [['tecnico', 'Técnico'], ['graduacao', 'Graduação'], ['pos_graduacao', 'Pós-graduação'], ['mestrado', 'Mestrado'], ['doutorado', 'Doutorado']] as const;

// Vaga carregada do servidor: o vinculo existe, mas o nome nao volta.
const PLACEHOLDER_VINCULADO = 'Item já vinculado do catálogo';

interface Props {
  idx: number;
  criterio: Criterio;
  onChange: (requisito: Requisito) => void;
}

export function RequisitoFields({ idx, criterio, onChange }: Props) {
  const r = criterio.requisito ?? {};
  const set = (parcial: Partial<Requisito>) => onChange({ ...r, ...parcial });

  return (
    <div className="space-y-3 rounded-md border border-dashed p-3">
      <p className="text-[12px] font-semibold">Requisito verificável (obrigatório)</p>

      {(criterio.tipo_criterio === 'skill_tecnica' || criterio.tipo_criterio === 'certificacao') && (
        <div className="space-y-1.5">
          <Label htmlFor={`req-item-${idx}`} className="text-[12px]">
            {criterio.tipo_criterio === 'skill_tecnica' ? 'Habilidade do catálogo *' : 'Certificação do catálogo *'}
          </Label>
          {/* Sem `required` nativo: ao editar, o nome nao volta do servidor e o
              campo vazio travaria o envio mesmo com o vinculo mantido. A
              validacao fica no handleSubmit do VagaForm. */}
          <CatalogoCombobox id={`req-item-${idx}`}
            tipo={criterio.tipo_criterio === 'skill_tecnica' ? 'habilidade' : 'certificacao'}
            texto={r.rotulo ?? ''} itemId={r.itemId ?? null}
            placeholder={r.itemId ? PLACEHOLDER_VINCULADO : undefined}
            onChange={({ texto, itemId }) => set({ rotulo: texto, itemId: itemId ?? undefined })} />
        </div>
      )}

      {criterio.tipo_criterio === 'skill_tecnica' && (
        <div className="space-y-1.5">
          <Label className="text-[12px]">Nível mínimo</Label>
          <Select value={r.nivelMinimo ?? 'qualquer'} onValueChange={(v) => set({ nivelMinimo: (v === 'qualquer' ? undefined : v) as Requisito['nivelMinimo'] })}>
            <SelectTrigger><SelectValue placeholder="Qualquer nível" /></SelectTrigger>
            <SelectContent>{NIVEIS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {criterio.tipo_criterio === 'formacao' && (
        <>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Grau mínimo *</Label>
            <Select value={r.grauMinimo ?? ''} onValueChange={(v) => set({ grauMinimo: v as Requisito['grauMinimo'] })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{GRAUS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`req-area-${idx}`} className="text-[12px]">Área do curso (vazio = qualquer área)</Label>
            <CatalogoCombobox id={`req-area-${idx}`} tipo="area_curso" texto={r.rotulo ?? ''} itemId={r.areaId ?? null} avisoForaDoCatalogo
              placeholder={r.areaId ? PLACEHOLDER_VINCULADO : undefined}
              onChange={({ texto, itemId }) => set({ rotulo: texto, areaId: itemId })} />
          </div>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={r.aceitaCursando === true} onChange={(e) => set({ aceitaCursando: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-primary" />
            Aceita formação em andamento
          </label>
        </>
      )}

      {criterio.tipo_criterio === 'experiencia' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`req-area-${idx}`} className="text-[12px]">Área de atuação *</Label>
            <CatalogoCombobox id={`req-area-${idx}`} tipo="area_atuacao" texto={r.rotulo ?? ''} itemId={r.areaId ?? null}
              placeholder={r.areaId ? PLACEHOLDER_VINCULADO : undefined}
              onChange={({ texto, itemId }) => set({ rotulo: texto, areaId: itemId })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`req-meses-${idx}`} className="text-[12px]">Meses mínimos</Label>
            <Input id={`req-meses-${idx}`} type="number" min={0} max={600} step={1}
              value={r.mesesMinimos ?? 0} onChange={(e) => set({ mesesMinimos: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })} />
          </div>
        </div>
      )}
    </div>
  );
}
