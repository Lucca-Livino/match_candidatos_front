import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, Power, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/layout/pagination';
import { ConfirmDialog } from '@/features/perfil/components/ConfirmDialog';
import { ConvidarUsuarioDialog } from './ConvidarUsuarioDialog';
import {
  alterarStatusUsuario, excluirUsuario, listarUsuariosInternos, reenviarConvite,
} from '../api';
import type { FiltrosUsuarios, PaginaUsuarios, SituacaoUsuario, UsuarioInterno } from '../types';

const TODOS = 'todos';

const ROTULO_SITUACAO: Record<SituacaoUsuario, { texto: string; classe: string }> = {
  pendente:   { texto: 'Pendente',   classe: 'bg-amber-50 text-amber-800 border-amber-200' },
  ativo:      { texto: 'Ativo',      classe: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  desativado: { texto: 'Desativado', classe: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const ROTULO_PAPEL: Record<string, string> = { recrutador: 'Recrutador', suporte: 'Suporte' };

const formatarData = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

export function PainelUsuarios() {
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({ page: 1 });
  const [pagina, setPagina] = useState<PaginaUsuarios | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [emAcao, setEmAcao] = useState<string | null>(null);
  const [convidarAberto, setConvidarAberto] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<UsuarioInterno | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await listarUsuariosInternos(filtros);
      setPagina(resultado);
      // Página atual ficou além do fim (ex.: última linha removida): volta à última.
      if (resultado.totalPages > 0 && (filtros.page ?? 1) > resultado.totalPages) {
        setFiltros((f) => ({ ...f, page: resultado.totalPages }));
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    // carga inicial/refiltro: carregar() liga o estado de loading antes do fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, [carregar]);

  async function executar(id: string, acao: () => Promise<void>, sucesso: string) {
    setEmAcao(id);
    setErro(null);
    setAviso(null);
    try {
      await acao();
      setAviso(sucesso);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'A operação falhou.');
    } finally {
      setEmAcao(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filtros.papel ?? TODOS}
            onValueChange={(v) => setFiltros((f) => ({ ...f, page: 1, papel: v === TODOS ? undefined : (v as FiltrosUsuarios['papel']) }))}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filtrar por papel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os papéis</SelectItem>
              <SelectItem value="recrutador">Recrutador</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filtros.situacao ?? TODOS}
            onValueChange={(v) => setFiltros((f) => ({ ...f, page: 1, situacao: v === TODOS ? undefined : (v as SituacaoUsuario) }))}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filtrar por situação">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas as situações</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="desativado">Desativado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="rounded-xl" onClick={() => setConvidarAberto(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar usuário
        </Button>
      </div>

      {aviso && <p className="text-[13px] text-emerald-700">{aviso}</p>}
      {erro && <p className="text-[13px] text-red-600">{erro}</p>}

      <div className="rounded-xl border border-outline-variant bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Convite</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-on-surface-variant">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Carregando…
                </TableCell>
              </TableRow>
            ) : pagina && pagina.docs.length > 0 ? (
              pagina.docs.map((u) => {
                const situacao = ROTULO_SITUACAO[u.situacao];
                const ocupado = emAcao === u._id;
                return (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{ROTULO_PAPEL[u.tipos_permissao[0]] ?? u.tipos_permissao[0]}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={situacao.classe}>{situacao.texto}</Badge>
                    </TableCell>
                    <TableCell>{formatarData(u.convidadoEm)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {u.situacao === 'pendente' && (
                          <Button
                            variant="ghost" size="sm" disabled={ocupado}
                            onClick={() => executar(u._id, () => reenviarConvite(u._id), `Convite reenviado para ${u.email}.`)}
                          >
                            <Mail className="h-4 w-4 mr-1" />Reenviar
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="sm" disabled={ocupado}
                          onClick={() => {
                            const ativar = u.situacao === 'desativado';
                            void executar(
                              u._id,
                              () => alterarStatusUsuario(u._id, ativar),
                              ativar ? `${u.nome} foi reativado(a).` : `${u.nome} foi desativado(a).`,
                            );
                          }}
                        >
                          <Power className="h-4 w-4 mr-1" />
                          {u.situacao === 'desativado' ? 'Reativar' : 'Desativar'}
                        </Button>
                        <Button
                          variant="ghost" size="sm" disabled={ocupado}
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setParaExcluir(u)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-on-surface-variant">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagina && pagina.totalPages > 1 && (
        <Pagination
          page={pagina.page}
          totalPages={pagina.totalPages}
          onPageChange={(page) => setFiltros((f) => ({ ...f, page }))}
        />
      )}

      <ConvidarUsuarioDialog
        open={convidarAberto}
        onOpenChange={setConvidarAberto}
        onConvidado={(email) => {
          setAviso(`Convite enviado para ${email}.`);
          setFiltros((f) => ({ ...f, page: 1 }));
        }}
      />

      <ConfirmDialog
        open={paraExcluir !== null}
        onOpenChange={(o) => { if (!o) setParaExcluir(null); }}
        title="Excluir usuário"
        description={paraExcluir ? `A conta de ${paraExcluir.nome} (${paraExcluir.email}) será removida e o acesso, revogado. Esta ação não pode ser desfeita.` : undefined}
        onConfirm={async () => {
          if (!paraExcluir) return;
          await excluirUsuario(paraExcluir._id);
          setAviso(`${paraExcluir.nome} foi excluído(a).`);
          await carregar();
        }}
      />
    </div>
  );
}
